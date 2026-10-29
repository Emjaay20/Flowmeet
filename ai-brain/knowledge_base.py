"""
FlowMeet Enterprise Knowledge Base & Product Enablement Repository.
Contains curated technical documentation indexed for sub-millisecond semantic RAG retrieval.
"""

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "doc_auth_01",
        "title": "API Authentication & Ingestion Secret Verification",
        "category": "security",
        "keywords": ["auth", "authentication", "secret", "token", "header", "x-flowmeet-secret", "api key", "unauthorized", "401"],
        "snippet": "All backend ingestion calls must provide the header 'x-flowmeet-secret' matching the environment variable FLOWMEET_INGEST_SECRET. Missing or mismatched headers return 401 Unauthorized.",
        "content": (
            "To authenticate REST API requests against FlowMeet endpoints (/api/ingest, /api/leads):\n"
            "1. Pass the header 'x-flowmeet-secret: <YOUR_SECRET_KEY>'\n"
            "2. For Bearer auth on enterprise routes, pass 'Authorization: Bearer <JWT_TOKEN>'\n"
            "If you receive a 401 Unauthorized, verify that FLOWMEET_INGEST_SECRET is configured in your production environment variables."
        ),
        "code_snippet": "curl -X POST https://api.flowmeet.ai/api/ingest \\\n  -H 'Content-Type: application/json' \\\n  -H 'x-flowmeet-secret: fm_live_sec_99482' \\\n  -d '{\"name\":\"Jane Doe\",\"email\":\"jane@acme.com\"}'",
        "url": "/docs/authentication#ingest-secret"
    },
    {
        "id": "doc_sso_02",
        "title": "Enterprise SAML 2.0 & Okta / Azure AD Single Sign-On (SSO)",
        "category": "enterprise",
        "keywords": ["sso", "saml", "okta", "azure ad", "google workspace", "identity", "idp", "single sign on"],
        "snippet": "FlowMeet supports SAML 2.0 assertion consumers for Okta, Azure Active Directory, and Google Workspace. JIT (Just-In-Time) user provisioning automatically maps enterprise roles.",
        "content": (
            "Configuring Enterprise SAML 2.0:\n"
            "1. In your IdP (Okta/Azure AD), configure ACS URL: https://auth.flowmeet.ai/sso/saml/callback\n"
            "2. Entity ID: urn:flowmeet:sp:prod\n"
            "3. Upload your IdP Metadata XML in FlowMeet Admin > Settings > Security > SAML.\n"
            "User accounts will automatically be provisioned with Role-Based Access Control (RBAC)."
        ),
        "code_snippet": None,
        "url": "/docs/security/saml-sso"
    },
    {
        "id": "doc_crawler_03",
        "title": "Rust Web-to-LLM Crawler & Firmographic Enrichment",
        "category": "infrastructure",
        "keywords": ["crawler", "rust", "scrape", "scraping", "firmographics", "firecrawl", "markdown", "tokens", "enrichment"],
        "snippet": "The Rust crawler service runs on port 8081 using Tokio and Axum. It converts raw target HTML into cleaned Markdown tokens with tech stack detection and employee size estimation.",
        "content": (
            "The /api/scrape endpoint invokes the high-throughput Rust crawler:\n"
            "- Extracts page title, meta descriptions, and clean Markdown stripped of ads/nav.\n"
            "- Detects 15+ modern technology frameworks (Next.js, Kubernetes, Docker, Stripe, Salesforce, Rust).\n"
            "- Calculates an automated ICP Intent Score (0-100) based on SOC 2 Type II badges and enterprise pricing pages."
        ),
        "code_snippet": "curl -X POST https://api.flowmeet.ai/api/scrape \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"url\":\"stripe.com/pricing\",\"extract_firmographics\":true}'",
        "url": "/docs/architecture/rust-crawler"
    },
    {
        "id": "doc_concierge_04",
        "title": "GoLang Territory Routing & Instant Calendar Booking",
        "category": "routing",
        "keywords": ["routing", "territory", "concierge", "golang", "calendar", "round robin", "lead score", "chili piper", "booking"],
        "snippet": "Our Go microservice routes leads in sub-50 microseconds. ICP scores >= 85 trigger VIP Instant Calendar Lock with regional Enterprise AEs; scores < 65 deflect to self-serve docs.",
        "content": (
            "How Go Concierge territory evaluation works:\n"
            "- EMEA (Munich/London): Elena Rostova (VP Enterprise RevOps)\n"
            "- APAC (Singapore/Tokyo): Marcus Tan (Head of APAC Enterprise)\n"
            "- Americas (San Francisco/NY): Sarah Jenkins (Senior Enterprise Architect)\n"
            "Evaluates executive seniority (VP/C-Level +20 pts), headcount (1000+ +25 pts), and free webmail penalties (-25 pts)."
        ),
        "code_snippet": "curl -X POST https://api.flowmeet.ai/api/route-lead \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"email\":\"alex@corp.com\",\"role\":\"VP Engineering\",\"employees\":1500,\"region\":\"EMEA\"}'",
        "url": "/docs/architecture/go-concierge"
    },
    {
        "id": "doc_rate_limit_05",
        "title": "Nginx Edge Rate Limiting & High-Availability Defense",
        "category": "infrastructure",
        "keywords": ["rate limit", "nginx", "ddos", "429", "throttling", "traffic", "cgroup", "vps", "burst"],
        "snippet": "FlowMeet utilizes Nginx limit_req_zone caching to restrict API ingestion to 50 requests/sec with burst buffers. Exceeding limits returns HTTP 429 Too Many Requests.",
        "content": (
            "Rate limiting policy:\n"
            "- Default API rate: 50 req/sec per IP with burst=20 nodelay.\n"
            "- Public form submission: 5 req/min to protect against automated bot spam.\n"
            "If you receive 429 Too Many Requests, implement exponential backoff with jitter or upgrade to dedicated enterprise VPC peering."
        ),
        "code_snippet": "# Nginx Configuration Directive\nlimit_req_zone $binary_remote_addr zone=api_limit:10m rate=50r/s;\nlimit_req zone=api_limit burst=20 nodelay;",
        "url": "/docs/devops/rate-limits"
    },
    {
        "id": "doc_webhook_06",
        "title": "Outbound Webhooks, CRM Sync & Salesforce / HubSpot Payloads",
        "category": "integrations",
        "keywords": ["webhook", "crm", "salesforce", "hubspot", "sync", "payload", "hmac", "event", "leads"],
        "snippet": "FlowMeet dispatches signed HMAC-SHA256 webhook payloads upon lead qualification and meeting booking. Integrates natively with Salesforce, HubSpot, and Slack.",
        "content": (
            "Subscribing to webhook events:\n"
            "Supported events: 'lead.qualified', 'meeting.scheduled', 'lead.deflected'.\n"
            "Each webhook POST includes the header 'X-FlowMeet-Signature: sha256=<HASH>' computed using your webhook signing secret.\n"
            "Payloads contain full firmographics, ICP score, assigned AE calendar link, and enriched employee sizing."
        ),
        "code_snippet": "const crypto = require('crypto');\nconst expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');\nconst isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expected}`));",
        "url": "/docs/integrations/webhooks"
    }
]
