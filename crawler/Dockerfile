# Stage 1: Build static optimized binary
FROM rust:1.82-slim-bookworm AS builder

WORKDIR /usr/src/app

# Install compilation prerequisites
RUN apt-get update && apt-get install -y pkg-config libssl-dev git && rm -rf /var/lib/apt/lists/*

# Copy manifest and source code
COPY Cargo.toml ./
COPY src ./src

# Compile release build (stripped & optimized for minimal RAM footprint)
RUN cargo build --release

# Stage 2: Minimal runtime production image
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
ENV RUST_LOG="flowmeet_crawler=info,axum=info"
ENV TOKIO_WORKER_THREADS=2

# Liveness check probe for Docker / Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8081/health || exit 1

ENTRYPOINT ["flowmeet-crawler"]
