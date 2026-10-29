# Stage 1: Build static optimized Go binary
FROM golang:1.22-alpine AS builder

WORKDIR /usr/src/app

# Install git and certificates
RUN apk add --no-cache git ca-certificates tzdata

# Copy module manifest and source files
COPY go.mod ./
COPY *.go ./

# Compile static release binary with stripped debugging tables for minimal RAM load
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /flowmeet-concierge .

# Stage 2: Clean Alpine production environment
FROM alpine:3.20 AS runtime

# Install certificates and curl for liveness checking
RUN apk add --no-cache ca-certificates tzdata curl && rm -rf /var/cache/apk/*

# Create unprivileged non-root service account for DevOps enterprise security
RUN adduser -D -u 1002 flowconcierge
USER flowconcierge
WORKDIR /home/flowconcierge

# Copy compiled static artifact from builder stage
COPY --from=builder --chown=flowconcierge:flowconcierge /flowmeet-concierge /usr/local/bin/flowmeet-concierge

# Expose Go concierge port
EXPOSE 8082

# Environmental variables for concurrency and memory tuning
ENV GOMAXPROCS=2
ENV GOGC=100

# Docker / Kubernetes health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8082/health || exit 1

ENTRYPOINT ["flowmeet-concierge"]
