mod scraper;
mod signals;
mod telemetry;

use crate::scraper::{perform_scrape, ScrapeRequest};
use crate::signals::analyze_signals;
use crate::telemetry::{ScopedTimer, TelemetryRegistry, W3cTraceContext};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use flowmeet_permissions::prelude::*;
use serde_json::json;
use std::net::SocketAddr;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
pub struct AppState {
    pub policy_engine: Arc<PolicyEngine>,
    pub telemetry: Arc<TelemetryRegistry>,
}

#[tokio::main]
async fn main() {
    // Initialize structured production logging
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::from_default_env()
                .add_directive("flowmeet_crawler=info".parse().unwrap())
                .add_directive("flowmeet_permissions=info".parse().unwrap()),
        )
        .init();

    info!("flowmeet-crawler starting with Prometheus telemetry enabled");

    // Initialize platform authorization engine with standard FlowMeet policy definitions
    let policy_engine = Arc::new(PolicyEngine::flowmeet_standard());
    let telemetry = TelemetryRegistry::new();
    let state = AppState {
        policy_engine,
        telemetry,
    };

    // Configure CORS for Next.js frontend and local dev testing
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build Axum HTTP Router with shared platform state and metrics
    let app = Router::new()
        .route("/", get(health_check))
        .route("/health", get(health_check))
        .route("/metrics", get(metrics_handler))
        .route("/scrape", post(handle_scrape))
        .route("/analyze", post(handle_analyze))
        .with_state(state)
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    info!("listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind TCP port 8081");
    axum::serve(listener, app)
        .await
        .expect("Failed to start Axum HTTP server");
}

/// Liveness probe with active telemetry check
async fn health_check(State(state): State<AppState>) -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "service": "flowmeet-crawler",
        "version": env!("CARGO_PKG_VERSION"),
        "permissions_engine": "active",
        "telemetry_metrics": "active",
        "active_in_flight_requests": state.telemetry.active_requests.load(Ordering::Relaxed),
    }))
}

/// Prometheus scrape endpoint (/metrics)
async fn metrics_handler(State(state): State<AppState>) -> impl IntoResponse {
    (
        StatusCode::OK,
        [("content-type", "text/plain; version=0.0.4; charset=utf-8")],
        state.telemetry.render_prometheus(),
    )
}

/// HTTP Handler for POST /scrape with policy enforcement and distributed tracing
async fn handle_scrape(
    State(state): State<AppState>,
    headers: HeaderMap,
    auth: Option<AuthenticatedSubject>,
    Json(payload): Json<ScrapeRequest>,
) -> impl IntoResponse {
    let trace_ctx = W3cTraceContext::from_header_or_generate(
        headers.get("traceparent").and_then(|h| h.to_str().ok()),
    );
    let timer = ScopedTimer::start();
    state
        .telemetry
        .active_requests
        .fetch_add(1, Ordering::Relaxed);

    let subject = auth.map(|a| a.0).unwrap_or_else(|| {
        Subject::builder("svc:flowmeet-mesh")
            .role("operator")
            .build()
    });

    let ctx = EvaluationContext::default();
    let resource = format!("domain:{}", payload.url);

    // Timed policy evaluation
    let eval_timer = ScopedTimer::start();
    let eval_res = state
        .policy_engine
        .evaluate(&subject, "crawler:scrape", &resource, &ctx);
    let eval_nanos = eval_timer.elapsed_nanos();

    if let Err(err) = eval_res {
        state
            .telemetry
            .record_policy_eval("crawler:scrape", "deny", eval_nanos);
        state.telemetry.record_http_request(
            "/scrape",
            StatusCode::FORBIDDEN.as_u16(),
            timer.elapsed_millis(),
        );
        state
            .telemetry
            .active_requests
            .fetch_sub(1, Ordering::Relaxed);
        error!("Scrape authorization denied for {}: {}", subject.id, err);
        return (
            [("traceparent", trace_ctx.to_header_value())],
            err.into_response(),
        )
            .into_response();
    }
    state
        .telemetry
        .record_policy_eval("crawler:scrape", "allow", eval_nanos);

    info!(
        "Received scrape task for URL: {} (authorized principal: {}, trace: {})",
        payload.url, subject.id, trace_ctx.trace_id
    );

    let response = match perform_scrape(payload).await {
        Ok(res) => {
            let duration = timer.elapsed_millis();
            state
                .telemetry
                .record_http_request("/scrape", StatusCode::OK.as_u16(), duration);
            info!(
                "Successfully processed {} in {}ms",
                res.url, res.execution_time_ms
            );
            (StatusCode::OK, Json(json!(res))).into_response()
        }
        Err(e) => {
            let duration = timer.elapsed_millis();
            state.telemetry.record_http_request(
                "/scrape",
                StatusCode::BAD_GATEWAY.as_u16(),
                duration,
            );
            error!("Scraping failed: {}", e);
            (
                StatusCode::BAD_GATEWAY,
                Json(json!({ "error": "scrape failed", "details": e })),
            )
                .into_response()
        }
    };

    state
        .telemetry
        .active_requests
        .fetch_sub(1, Ordering::Relaxed);
    ([("traceparent", trace_ctx.to_header_value())], response).into_response()
}

#[derive(serde::Deserialize)]
struct AnalyzeRequest {
    url: String,
    markdown: String,
}

/// POST /analyze: run the same keyword signals over text fetched elsewhere
/// with policy evaluation and telemetry recording.
async fn handle_analyze(
    State(state): State<AppState>,
    headers: HeaderMap,
    auth: Option<AuthenticatedSubject>,
    Json(payload): Json<AnalyzeRequest>,
) -> impl IntoResponse {
    let trace_ctx = W3cTraceContext::from_header_or_generate(
        headers.get("traceparent").and_then(|h| h.to_str().ok()),
    );
    let timer = ScopedTimer::start();
    state
        .telemetry
        .active_requests
        .fetch_add(1, Ordering::Relaxed);

    let subject = auth.map(|a| a.0).unwrap_or_else(|| {
        Subject::builder("svc:flowmeet-mesh")
            .role("operator")
            .build()
    });

    let ctx = EvaluationContext::default();
    let resource = format!("domain:{}", payload.url);

    let eval_timer = ScopedTimer::start();
    let eval_res = state
        .policy_engine
        .evaluate(&subject, "crawler:analyze", &resource, &ctx);
    let eval_nanos = eval_timer.elapsed_nanos();

    if let Err(err) = eval_res {
        state
            .telemetry
            .record_policy_eval("crawler:analyze", "deny", eval_nanos);
        state.telemetry.record_http_request(
            "/analyze",
            StatusCode::FORBIDDEN.as_u16(),
            timer.elapsed_millis(),
        );
        state
            .telemetry
            .active_requests
            .fetch_sub(1, Ordering::Relaxed);
        error!("Analyze authorization denied for {}: {}", subject.id, err);
        return (
            [("traceparent", trace_ctx.to_header_value())],
            err.into_response(),
        )
            .into_response();
    }
    state
        .telemetry
        .record_policy_eval("crawler:analyze", "allow", eval_nanos);

    let signals = analyze_signals(&payload.url, "", &payload.markdown);
    let duration = timer.elapsed_millis();
    state
        .telemetry
        .record_http_request("/analyze", StatusCode::OK.as_u16(), duration);
    state
        .telemetry
        .active_requests
        .fetch_sub(1, Ordering::Relaxed);

    (
        [("traceparent", trace_ctx.to_header_value())],
        (
            StatusCode::OK,
            Json(json!({ "firmographic_signals": signals })),
        ),
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_state_initialization() {
        let engine = Arc::new(PolicyEngine::flowmeet_standard());
        let telemetry = TelemetryRegistry::new();
        let state = AppState {
            policy_engine: engine,
            telemetry,
        };
        assert!(state
            .policy_engine
            .evaluate(
                &Subject::builder("operator-1").role("operator").build(),
                "crawler:scrape",
                "domain:test.com",
                &EvaluationContext::default(),
            )
            .is_ok());
    }
}
