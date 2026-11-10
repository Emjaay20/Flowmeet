mod signals;
mod scraper;

use axum::{
    routing::{get, post},
    Router,
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, error};
use tracing_subscriber::EnvFilter;
use crate::scraper::{perform_scrape, ScrapeRequest};
use crate::signals::analyze_signals;

#[tokio::main]
async fn main() {
    // Initialize structured production logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("flowmeet_crawler=info".parse().unwrap()))
        .init();

    info!("flowmeet-crawler starting");

    // Configure CORS for Next.js frontend and local dev testing
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build Axum HTTP Router
    let app = Router::new()
        .route("/", get(health_check))
        .route("/health", get(health_check))
        .route("/scrape", post(handle_scrape))
        .route("/analyze", post(handle_analyze))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    info!("listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.expect("Failed to bind TCP port 8081");
    axum::serve(listener, app).await.expect("Failed to start Axum HTTP server");
}

/// Liveness probe
async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "service": "flowmeet-crawler",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

/// HTTP Handler for POST /scrape
async fn handle_scrape(Json(payload): Json<ScrapeRequest>) -> impl IntoResponse {
    info!("Received scrape task for URL: {}", payload.url);
    match perform_scrape(payload).await {
        Ok(res) => {
            info!("Successfully processed {} in {}ms", res.url, res.execution_time_ms);
            (StatusCode::OK, Json(json!(res)))
        }
        Err(e) => {
            error!("Scraping failed: {}", e);
            (
                StatusCode::BAD_GATEWAY,
                Json(json!({ "error": "scrape failed", "details": e })),
            )
        }
    }
}

#[derive(serde::Deserialize)]
struct AnalyzeRequest {
    url: String,
    markdown: String,
}

/// POST /analyze: run the same keyword signals over text fetched elsewhere
/// (for example by Firecrawl), so both paths use one detector.
async fn handle_analyze(Json(payload): Json<AnalyzeRequest>) -> impl IntoResponse {
    let signals = analyze_signals(&payload.url, "", &payload.markdown);
    (StatusCode::OK, Json(json!({ "firmographic_signals": signals })))
}
