# FlowMeet Python AI Enablement Brain (`/ai-brain`)

A lightweight, high-performance Python microservice providing **Semantic Retrieval-Augmented Generation (RAG)**, technical documentation search, and autonomous Level-1 customer support ticket deflection.

---

## 🎯 Architectural Purpose & The "Product Enablement" Angle

In high-growth B2B platforms (such as **Luminovo** and **Chili Piper**), over 70% of inbound inquiries to sales engineers and customer success teams are repetitive technical questions (e.g., *"How do I configure SAML SSO with Okta?"*, *"Why am I getting 401 on the webhook endpoint?"*, *"What are the rate limit ceilings?"*).

By implementing our **AI Brain** in Python with a zero-bloat semantic RAG engine:
1. **Instant Resolution (< 2ms):** Queries are tokenized, normalized, and scored against indexed documentation in milliseconds without needing to make slow, costly external LLM API calls for every simple retrieval.
2. **Autonomous Ticket Deflection:** Accurately classifies whether an inquiry can be resolved with verified documentation (`AUTONOMOUS_DEFLECTION_SUCCESS`) or requires escalation to a human Solutions Architect (`HUMAN_ESCALATION_RECOMMENDED`).
3. **Ultra-Low Memory Footprint (< 60MB RAM):** By avoiding heavyweight PyTorch/Transformers runtimes for simple embedding lookups, this service fits easily into a modest **Oracle Cloud 1GB Linux VPS**, sharing resources smoothly with our Next.js frontend, Rust crawler, and Go concierge router.

---

## 🧭 API Endpoints

### `GET /health`
Returns service telemetry and runtime diagnostics.
```json
{
  "status": "operational",
  "service": "flowmeet-ai-brain",
  "version": "2.0.0",
  "engine": "FastAPI + Pure Python Semantic RAG",
  "indexed_documents": 6,
  "ram_target": "< 60MB RAM",
  "average_deflection_latency_ms": 1.45
}
```

### `POST /ai/deflect`
Evaluates customer question, computes document relevance, and produces an automated resolution.

**Request Payload:**
```json
{
  "query": "How do I configure SAML 2.0 single sign on for Okta?",
  "customer_tier": "ENTERPRISE",
  "company": "Automattic"
}
```

**Response Payload:**
```json
{
  "status": 200,
  "query": "How do I configure SAML 2.0 single sign on for Okta?",
  "resolution_status": "AUTONOMOUS_DEFLECTION_SUCCESS",
  "confidence_score": 99.5,
  "direct_answer": "Here is the verified technical resolution regarding 'Enterprise SAML 2.0 & Okta / Azure AD Single Sign-On (SSO)'...",
  "citations": [
    {
      "doc_id": "doc_sso_02",
      "title": "Enterprise SAML 2.0 & Okta / Azure AD Single Sign-On (SSO)",
      "section": "ENTERPRISE",
      "relevance_score": 99.5,
      "snippet": "FlowMeet supports SAML 2.0 assertion consumers for Okta...",
      "documentation_url": "/docs/security/saml-sso"
    }
  ],
  "saved_support_minutes": 25,
  "execution_time_ms": 1.2,
  "worker_node": "python-fastapi-ai-brain-01"
}
```

### `GET /ai/stats`
Returns aggregate enablement metrics (deflection rate %, saved engineering hours).

---

## 🛠️ Docker & Local Execution

```bash
# Build the production image
docker build -t flowmeet-ai-brain:latest .

# Run with an explicit 95MB memory limit
docker run -p 8083:8083 --memory="95m" --cpus="0.5" flowmeet-ai-brain:latest
```
