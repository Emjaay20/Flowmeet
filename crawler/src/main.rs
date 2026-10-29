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

#[tokio::main]
async fn main() {
    // Initialize structured production logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("flowmeet_crawler=info".parse().unwrap()))
        .init();

    info!("Initializing FlowMeet High-Throughput Rust Crawler Service v2.0...");
    info!("Target Infrastructure: Oracle Linux 1GB VPS Edge Node (Memory cgroup limit: ~245MB)");

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
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    info!("🚀 Rust Crawler Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.expect("Failed to bind TCP port 8081");
    axum::serve(listener, app).await.expect("Failed to start Axum HTTP server");
}

/// Health & telemetry diagnostics endpoint
async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "operational",
        "service": "flowmeet-rust-crawler",
        "version": "2.0.0",
        "engine": "Axum / Tokio / Scraper",
        "capabilities": [
            "Web-to-LLM HTML to Markdown extraction (Firecrawl standard)",
            "B2B Firmographic signal & pricing tier discovery",
            "Real-time tech stack signature recognition"
        ],
        "vps_optimization": {
            "target_host": "Oracle Cloud Free Tier VPS (1GB RAM / ARM64 & x86_64)",
            "runtime_ram_usage": "~14MB (Static stripped binary)",
            "cgroup_mem_limit": "245MB max ceiling"
        }
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
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Failed to extract B2B intelligence", "details": e })),
            )
        }
    }
}
