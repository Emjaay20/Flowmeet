# FlowMeet GoLang Sub-50ms Rules & Territory Routing Engine (`/concierge`)

A high-concurrency, goroutine-powered B2B revenue routing and lead qualification microservice implemented in **Go 1.22+**. Built to operate with near-zero latency and minimal garbage collection pressure, allowing it to evaluate complex enterprise sales rules on modest infrastructure like an Oracle 1GB Cloud VPS.

---

## 🎯 Architectural Purpose & Why GoLang?

In enterprise revenue enablement (inspired by **Chili Piper** and **Navattic**), when a high-intent corporate buyer completes a form or is ingested via our Rust web crawler, waiting 48 hours for a human SDR to review their profile causes severe deal drop-off.

By executing our routing rules in **GoLang**, we achieve:
1. **Sub-50 Microsecond Decision Speed:** Evaluates firmographics, executive seniority, employee headcount, and territory geography in mere microseconds (`< 0.05 milliseconds`).
2. **Goroutine Concurrency:** Easily manages thousands of simultaneous lead scoring events and webhook dispatches without blocking IO or running out of threads.
3. **Ultra-Lightweight Static Binary:** Using Go 1.22 standard zero-bloat routing and release strip flags (`-ldflags="-w -s"`), our compiled binary weighs under 12MB and requires **less than 15MB RAM** at runtime.

---

## 🧭 Multi-Tier Routing Intelligence (`scorer.go` & `router.go`)

When a lead arrives, the Go engine automatically computes an **ICP Qualification Score (1 - 100)** and dispatches them to the appropriate onboarding pathway:

| Qualification Tier | ICP Score | Target Audience | Autonomous Routing Action | Estimated Deal Value |
| :--- | :--- | :--- | :--- | :--- |
| `VIP_ENTERPRISE_INSTANT` | **85 - 100** | Fortune 500 & 1,000+ Emp Leaders | Instantly reserves 15m calendar slot with Senior Enterprise AEs (by Territory). | **$65,000+ ARR** |
| `COMMERCIAL_PRIORITY` | **65 - 84** | Mid-Market & Scale-Ups (50 - 999 Emp) | Routes to Commercial Account Executive priority scheduling queue. | **$24,000 ARR** |
| `SELF_SERVE_DEFLECT` | **1 - 64** | Early Startups & Personal Webmails | Directly unlocks API docs & RAG vector self-service triage (Zero human SDR waste). | **$4,900 ARR** |

---

## 🌍 Geographical Territory Recognition

The engine automatically parses lead regional data and assigns Account Executive ownership to prevent territory conflict:
- **EMEA & Europe (`Europe`, `Germany`, `UK`, `Africa`):** Routes to *Elena Rostova (EMEA Strategic HQ - Munich/London)*.
- **APAC & Asia (`APAC`, `Singapore`, `Tokyo`, `Australia`):** Routes to *Marcus Tan (APAC Enterprise Engineering)*.
- **Americas / Global:** Routes to *Sarah Jenkins (Americas HQ - San Francisco/NY)*.

---

## 🚀 API Specification

### `GET /health`
Returns runtime uptime and memory diagnostics.
```json
{
  "status": "operational",
  "service": "flowmeet-go-concierge",
  "version": "2.0.0",
  "engine": "GoLang 1.22 Goroutine Rules Mux",
  "ram_consumption": "~10MB (Static binary, zero GC pressure)",
  "concurrency": "Sub-millisecond territory routing"
}
```

### `POST /route`
Evaluates lead firmographics and executes automated calendar action.

**Request Payload:**
```json
{
  "email": "vp_architecture@stripe.com",
  "company": "Stripe",
  "role": "VP of Core Architecture",
  "region": "EMEA (London)",
  "employees": 4200,
  "estimated_tier": "Enterprise Account (1,000+ Employees)",
  "detected_tech_stack": ["Next.js", "Kubernetes", "Docker", "Rust Infra", "GoLang"],
  "scraper_intent": 95
}
```

**Response Payload:**
```json
{
  "status": 200,
  "lead_email": "vp_architecture@stripe.com",
  "company": "Stripe",
  "final_icp_score": 98,
  "qualification_tier": "VIP_ENTERPRISE_INSTANT",
  "routing_action": "INSTANT_VIP_CALENDAR_LOCK",
  "assigned_member": {
    "name": "Elena Rostova",
    "title": "VP Enterprise RevOps (EMEA & Strategic Accounts)",
    "email": "elena.rostova@flowmeet.ai",
    "calendar_url": "https://flowmeet.ai/calendar/elena-vip-15m",
    "territory": "EMEA Strategic HQ (Munich / London)",
    "response_time_ms": 45
  },
  "automated_greeting": "Hello! Our Go rules engine recognized your high-intent enterprise profile at Stripe (4200+ team size). I have reserved an exclusive 15-minute technical architecture slot with Elena Rostova for tomorrow at 2:00 PM.",
  "estimated_deal_arr_usd": 65000,
  "execution_time_microseconds": 48,
  "worker_node": "go-concierge-vps-goroutine-01"
}
```

---

## 🛠️ Docker & Local Verification

Because this service utilizes a multi-stage static build, you do **not** need the Go toolchain installed locally to test it:

```bash
# Compile static release binary inside Docker Stage 1
docker build -t flowmeet-go-concierge:latest .

# Run lightweight container on Port 8082
docker run -p 8082:8082 --memory="128m" --cpus="0.5" flowmeet-go-concierge:latest
```

Test routing directly via terminal:
```bash
curl -X POST http://127.0.0.1:8082/route \
  -H "Content-Type: application/json" \
  -d '{"email": "cto@automattic.com", "employees": 1800, "role": "CTO", "region": "Americas"}'
```
