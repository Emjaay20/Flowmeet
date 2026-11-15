# Stage 1: Base cargo-chef environment with Rust toolchain
FROM lukemathwalker/cargo-chef:latest-rust-1-bookworm AS chef
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y pkg-config libssl-dev git && rm -rf /var/lib/apt/lists/*

# Stage 2: Planner - analyzes dependency lockfiles and generates caching recipe
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3: Builder - cooks dependencies separately for Docker layer caching
FROM chef AS builder
COPY --from=planner /usr/src/app/recipe.json recipe.json
# Build and cache dependencies layer. Rebuilds only when Cargo dependencies change.
RUN cargo chef cook --release --recipe-path recipe.json

# Copy full source and compile release binary
COPY . .
RUN cargo build --release --bin flowmeet-crawler

# Stage 4: Minimal, unprivileged runtime production image
FROM debian:bookworm-slim AS runtime

# Install CA certificates for secure HTTPS scraping via reqwest
RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Create non-root unprivileged service user for enterprise DevOps security
RUN useradd -m -u 1001 -s /bin/bash flowcrawler
USER flowcrawler
WORKDIR /home/flowcrawler

# Copy built artifact from builder stage
COPY --from=builder --chown=flowcrawler:flowcrawler /usr/src/app/target/release/flowmeet-crawler /usr/local/bin/flowmeet-crawler

# Expose internal service port
EXPOSE 8081

# Environmental variables for tuning Tokio threads & log verbosity
ENV RUST_LOG="flowmeet_crawler=info,flowmeet_permissions=info,axum=info"
ENV TOKIO_WORKER_THREADS=2

# Liveness check probe for Docker / Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8081/health || exit 1

ENTRYPOINT ["flowmeet-crawler"]
