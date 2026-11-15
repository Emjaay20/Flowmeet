# FlowMeet High-Throughput Rust Crawler & Platform Permissions Engine (`/crawler`)

A production-grade, asynchronous web scraping and B2B firmographic intelligence microservice engineered in **Rust** using `Axum`, `Tokio`, `Reqwest`, and `Scraper`, powered by our shared platform authorization engine `flowmeet-permissions`. Designed to run inside lightweight Linux memory boundaries (`cgroups`) on constrained cloud environments like a 1GB Oracle Cloud VPS while delivering sub-second scraping latencies.

---

## 🏛️ Cargo Workspace Architecture

This directory is structured as a **Cargo Workspace**, reflecting modern enterprise Rust monolith/platform standards:

```
crawler/
├── Cargo.toml                    # Root workspace manifest & flowmeet-crawler binary
├── Dockerfile                    # Multi-stage container build with cargo-chef caching
├── .dockerignore                 # Excludes target/ artifacts for rapid context transfer
├── src/                          # flowmeet-crawler application logic
│   ├── main.rs                   # Axum HTTP server & platform policy integration
│   ├── scraper.rs                # Async DOM-to-markdown tokenization
│   ├── signals.rs                # Firmographic detection & whole-word regex matching
│   └── telemetry.rs              # Prometheus metrics exporter & W3C TraceContext
└── crates/
    ├── flowmeet-permissions/     # High-performance Platform Authorization Engine (ABAC/RBAC)
    │   ├── Cargo.toml
    │   ├── benches/
    │   │   └── policy_bench.rs   # Criterion sub-microsecond microbenchmarks
    │   └── src/
    │       ├── lib.rs            # Crate prelude and exports
    │       ├── bitflags_perms.rs # O(1) 64-bit ActionFlags
    │       ├── subject.rs        # Principal identity (users, services, AI agents)
    │       ├── policy.rs         # PolicyEngine, RoleHierarchy, and tenant boundary checks
    │       ├── macros.rs         # require_role!, require_flags!, and policy_rule! macros
    │       ├── middleware.rs     # Axum AuthenticatedSubject extractor & helpers
    │       └── error.rs          # PermissionError with RFC 7807 JSON serialization
    └── flowmeet-agent-tools/     # AI Agent Platform CLI & MCP Harness
        ├── Cargo.toml
        └── src/
            └── main.rs           # export-context, verify-action, lint-policies, mcp-tools
```

---

## 🛡️ Platform Permissions Engine (`flowmeet-permissions`)

Engineered specifically to solve platform-wide authorization and developer velocity for internal squads:

1. **64-bit Zero-Cost Bitflags (`ActionFlags`):**  
   Provides $O(1)$ bitmask capability checks (`READ`, `WRITE`, `SCRAPE`, `ENRICH`, `ROUTE`, `ADMIN`) on hot request paths without heap allocations.
2. **Role Hierarchy Graph with Transitive Inheritance:**  
   Resolves role parent-child graphs (e.g. `PlatformAdmin` $\rightarrow$ `Operator` $\rightarrow$ `Viewer` $\rightarrow$ `CrawlerAgent`).
3. **Multi-Tenant Boundary Enforcement (ABAC):**  
   Automatically blocks cross-tenant access attempts between autonomous agents or client workspaces.
4. **Defense-in-Depth Rule Precedence:**  
   Closed-world security model where explicit `Deny` rules strictly override `Allow` rules (e.g., blocking internal network and private VPC scrape requests).
5. **Ergonomic Declarative Macros:**  
   Simplifies policy authoring across engineering squads:
   ```rust
   let rule = policy_rule!(allow "rule_scrape", actions: ["crawler:*"], resources: ["domain:*"]);
   require_role!(subject, "operator");
   ```
6. **Axum Extractor & RFC 7807 Error Responses:**  
   Direct HTTP header authentication (`x-subject-id`, `x-subject-roles`, `x-tenant-id`) with automatic 403 Forbidden structured JSON error responses.

---

## ⚡ Core Crawler Capabilities

- **Zero-Overhead Concurrency:** Handles high parallel HTTP web requests and DOM parsing routines using `tokio` asynchronous tasks.
- **Minimal Memory Footprint:** Stripped release build (`opt-level = "z"`, `lto = true`, `codegen-units = 1`) consuming **~17.41 MiB active RSS** (under a 45 MiB cgroup ceiling).
- **Web-to-LLM Clean Markdown:** Converts open-web HTML into clean Markdown tokens, ready for immediate context insertion into vector embeddings or LLMs.
- **Firmographic Intelligence:** Traverses DOM trees to detect employee sizing tiers, 15+ tech stack signatures, and compliance indicators (SOC 2, SAML SSO).

---

## 🚀 API Endpoints & Specification

### `GET /health`
Returns telemetry, engine health, and active permissions engine status.
```json
{
  "status": "ok",
  "service": "flowmeet-crawler",
  "version": "0.1.0",
  "permissions_engine": "active",
  "telemetry_metrics": "active",
  "active_in_flight_requests": 0
}
```

### `GET /metrics`
Exposes real-time Prometheus 0.0.4 text format telemetry for Prometheus / Grafana scraping:
- `flowmeet_crawler_active_requests` (Gauge)
- `flowmeet_crawler_requests_total{endpoint, status}` (Counter)
- `flowmeet_policy_evaluations_total{action, effect}` (Counter)
- `flowmeet_scrape_duration_ms_bucket` (Histogram)
- `flowmeet_policy_eval_nanoseconds` (Summary)

### `POST /scrape`
Executes an authorized scrape and firmographic analysis task.

**Headers:**
- `x-subject-id`: Calling identity (e.g. `agent:crawler-1` or `user:alex`)
- `x-subject-roles`: Comma-separated roles (`operator`, `platform_admin`)
- `x-tenant-id`: Tenant isolation boundary (`tenant-alpha`)

**Request Payload:**
```json
{
  "url": "https://stripe.com"
}
```

**Response Payload:**
```json
{
  "url": "https://stripe.com",
  "execution_time_ms": 312,
  "page_title": "Stripe | Financial Infrastructure for the Internet",
  "markdown": "# Stripe...",
  "firmographic_signals": {
    "detected_tech_stack": ["Next.js", "Docker", "Stripe"],
    "enterprise_indicators": ["Mentions SOC 2 / ISO 27001 / GDPR", "Mentions SSO / SAML"],
    "estimated_size_tier": "Enterprise Account (1,000+ Employees)"
  }
}
```

---

## 🛠️ Testing & CI Verification

Run the full workspace test suite and lint checks:
```bash
# Run unit & integration tests across all workspace crates
cargo test --workspace

# Strict zero-warning linting
cargo clippy --workspace --all-targets -- -D warnings

# Formatting check
cargo fmt --all -- --check
```

---

## 📦 Containerization with `cargo-chef` Layer Caching

Our Dockerfile utilizes **`cargo-chef`** multi-stage compilation:
1. **Planner Stage:** Inspects `Cargo.lock` and creates a minimal compilation recipe.
2. **Builder Stage:** Pre-builds all external crates (`tokio`, `axum`, `reqwest`, etc.). Docker layer caching preserves this compiled dependency layer as long as dependencies remain unchanged.
3. **Application Stage:** Recompiles only the internal workspace crates in seconds.
4. **Runtime Stage:** Unprivileged `flowcrawler` user (`uid: 1001`) on a hardened `debian:bookworm-slim` image with Docker/K8s health checks.

```bash
# Build with Docker
docker build -t flowmeet-crawler:latest .

# Run locally
docker run -p 8081:8081 --memory="45m" flowmeet-crawler:latest
```
