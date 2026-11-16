mod scraper;
mod signals;
mod telemetry;

use crate::scraper::{perform_scrape, ScrapeRequest};
use crate::signals::analyze_signals;
use crate::telemetry::{ActiveRequest, ScopedTimer, TelemetryRegistry, W3cTraceContext};
use axum::{
    extract::{DefaultBodyLimit, Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::IntoResponse,
    response::Response,
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
    pub service_token: Arc<str>,
    pub slots: Arc<tokio::sync::Semaphore>,
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
    let service_token =
        std::env::var("FLOWMEET_SERVICE_TOKEN").expect("FLOWMEET_SERVICE_TOKEN must be configured");
    assert!(
        service_token.len() >= 32,
        "service token must be at least 32 characters"
    );
    let state = AppState {
        service_token: Arc::from(service_token),
        slots: Arc::new(tokio::sync::Semaphore::new(4)),
        policy_engine,
        telemetry,
    };

    // Configure CORS for Next.js frontend and local dev testing
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build Axum HTTP Router with shared platform state and metrics
    let protected = Router::new()
        .route("/scrape", post(handle_scrape))
        .route("/analyze", post(handle_analyze))
        .layer(DefaultBodyLimit::max(128 * 1024))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            authenticate_service,
        ));

    let app = Router::new()
        .route("/", get(health_check))
        .route("/health", get(health_check))
        .route("/metrics", get(metrics_handler))
        .merge(protected)
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

/// Only a configured service credential can establish the internal operator identity.
async fn authenticate_service(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Response {
    let valid = req
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|v| v == state.service_token.as_ref())
        .unwrap_or(false);
    if !valid {
        return PermissionError::MissingIdentity.into_response();
    }
    let Ok(_permit) = state.slots.clone().try_acquire_owned() else {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            "Crawler is busy; retry later",
        )
            .into_response();
    };
    req.extensions_mut().insert(
        Subject::builder("svc:flowmeet-web")
            .role("operator")
            .build(),
    );
    next.run(req).await
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
    auth: AuthenticatedSubject,
    Json(payload): Json<ScrapeRequest>,
) -> impl IntoResponse {
    let trace_ctx = W3cTraceContext::from_header_or_generate(
        headers.get("traceparent").and_then(|h| h.to_str().ok()),
    );
    let timer = ScopedTimer::start();
    let _active = ActiveRequest::start(state.telemetry.clone());

    let subject = auth.0;

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
    auth: AuthenticatedSubject,
    Json(payload): Json<AnalyzeRequest>,
) -> impl IntoResponse {
    let trace_ctx = W3cTraceContext::from_header_or_generate(
        headers.get("traceparent").and_then(|h| h.to_str().ok()),
    );
    let timer = ScopedTimer::start();
    let _active = ActiveRequest::start(state.telemetry.clone());

    let subject = auth.0;

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

    #[tokio::test]
    async fn rejects_missing_and_spoofed_identity_headers() {
        use tower::ServiceExt;
        let state = AppState {
            service_token: Arc::from("test-service-token-at-least-32-characters"),
            slots: Arc::new(tokio::sync::Semaphore::new(4)),
            policy_engine: Arc::new(PolicyEngine::flowmeet_standard()),
            telemetry: TelemetryRegistry::new(),
        };
        let app = Router::new()
            .route("/analyze", post(handle_analyze))
            .route_layer(middleware::from_fn_with_state(
                state.clone(),
                authenticate_service,
            ))
            .with_state(state);
        for authorization in [
            None,
            Some("Bearer incorrect"),
            Some("Bearer test-service-token-at-least-32-characters"),
        ] {
            let mut builder = axum::http::Request::builder()
                .method("POST")
                .uri("/analyze")
                .header("content-type", "application/json")
                .header("x-subject-roles", "platform_admin")
                .header("x-internal-mesh", "true");
            if let Some(value) = authorization {
                builder = builder.header("authorization", value);
            }
            let request = builder
                .body(axum::body::Body::from(
                    r#"{"url":"example.com","markdown":"Rust and Kubernetes"}"#,
                ))
                .unwrap();
            let response = app.clone().oneshot(request).await.unwrap();
            assert_eq!(
                response.status(),
                if authorization.is_some_and(|s| s.ends_with("32-characters")) {
                    StatusCode::OK
                } else {
                    StatusCode::UNAUTHORIZED
                }
            );
        }
    }

    #[test]
    fn test_app_state_initialization() {
        let engine = Arc::new(PolicyEngine::flowmeet_standard());
        let telemetry = TelemetryRegistry::new();
        let state = AppState {
            service_token: Arc::from("test-service-token-at-least-32-characters"),
            slots: Arc::new(tokio::sync::Semaphore::new(4)),
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
