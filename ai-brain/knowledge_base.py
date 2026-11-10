"""
Flowmeet documentation index.

These entries describe what the running code does. The search service ranks
them against a question with TF-IDF; there is no model behind it, so every
answer is one of these entries, quoted.
"""

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "doc_ingest_auth",
        "title": "Authenticating calls to /api/ingest",
        "category": "security",
        "keywords": ["ingest", "secret", "header", "auth", "authentication", "401", "unauthorized", "x-flowmeet-secret"],
        "snippet": "Server-to-server lead ingestion requires the x-flowmeet-secret header to match FLOWMEET_INGEST_SECRET.",
        "content": (
            "POST /api/ingest accepts a lead from your own backend or a form handler.\n"
            "Send the header 'x-flowmeet-secret' with the value of FLOWMEET_INGEST_SECRET from your .env file.\n"
            "A missing or wrong secret returns HTTP 401. Choose a long random value and keep it out of client-side code."
        ),
        "code_snippet": "curl -X POST https://YOUR_HOST/api/ingest \\\n  -H 'Content-Type: application/json' \\\n  -H 'x-flowmeet-secret: $FLOWMEET_INGEST_SECRET' \\\n  -d '{\"email\":\"lead@example.com\",\"company\":\"Example\"}'",
        "url": "/docs#authentication",
    },
    {
        "id": "doc_stream_enrich",
        "title": "How the live demo enriches a domain",
        "category": "pipeline",
        "keywords": ["enrich", "enrichment", "scrape", "scraper", "crawler", "firecrawl", "domain", "stream", "demo", "markdown"],
        "snippet": "POST /api/stream-enrich streams each step as server-sent events: fetch the site, score the lead, route it.",
        "content": (
            "The demo calls POST /api/stream-enrich with an email address. The server fetches the company's homepage with the Rust crawler, "
            "converts it to Markdown, and looks for keywords that hint at tech stack and company size. "
            "If the crawler cannot read the page and a Firecrawl key is configured, it asks Firecrawl instead. "
            "The result goes to the Go service, which returns a score, a tier and a roster entry. "
            "If no service can read the site, the stream says so and no score is made up."
        ),
        "code_snippet": "curl -N -X POST https://YOUR_HOST/api/stream-enrich \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"email\":\"someone@yourcompany.com\"}'",
        "url": "/docs#pipeline",
    },
    {
        "id": "doc_routing",
        "title": "Routing rules in the Go service",
        "category": "routing",
        "keywords": ["routing", "route", "territory", "score", "tier", "region", "roster", "rep", "assign", "icp", "concierge"],
        "snippet": "Score at or above 85 goes to an enterprise rep by region, 65 to 84 to the commercial queue, below 65 to self-serve.",
        "content": (
            "POST /route on the Go service (port 8082) adds points for headcount, seniority of the role, and the number of technologies detected, "
            "and subtracts points for free webmail addresses. Scores are capped at 100.\n"
            "Score 85 or more: enterprise rep, chosen by region (EMEA, APAC, otherwise the default rep).\n"
            "Score 65 to 84: commercial queue. Below 65: self-serve docs.\n"
            "The roster ships with placeholder entries in concierge/roster.go. Replace them with your team and set sampleRoster to false."
        ),
        "code_snippet": None,
        "url": "/docs#routing",
    },
    {
        "id": "doc_calcom",
        "title": "Cal.com booking and webhook verification",
        "category": "booking",
        "keywords": ["cal.com", "calcom", "booking", "webhook", "signature", "hmac", "x-cal-signature-256", "meeting", "calendar"],
        "snippet": "Flowmeet sends visitors to your Cal.com page; Cal.com tells Flowmeet about bookings via a signed webhook.",
        "content": (
            "POST /api/book-slot returns your FLOWMEET_BOOKING_URL with the visitor's email filled in. Availability and confirmation belong to Cal.com; "
            "Flowmeet does not create meetings itself.\n"
            "Cal.com reports BOOKING_CREATED, BOOKING_RESCHEDULED and BOOKING_CANCELLED to POST /api/webhooks/calcom. "
            "Flowmeet checks the x-cal-signature-256 header, an HMAC-SHA256 of the raw body keyed with CALCOM_WEBHOOK_SECRET, "
            "and stores each event once, keyed by a hash of the booking id, event type and timestamp."
        ),
        "code_snippet": None,
        "url": "/docs#booking",
    },
    {
        "id": "doc_event_signing",
        "title": "Signing events sent to /api/integrations/events",
        "category": "security",
        "keywords": ["event", "events", "sign", "signature", "timestamp", "hmac", "integration", "x-event-signature", "x-event-timestamp", "replay"],
        "snippet": "Events carry x-event-timestamp and x-event-signature; the signature covers the timestamp and the raw body.",
        "content": (
            "To send a lifecycle event (lead.qualified, meeting.booked, meeting.cancelled, customer.activated) post JSON to /api/integrations/events with "
            "x-event-timestamp (Unix seconds) and x-event-signature, the hex HMAC-SHA256 of '<timestamp>.<raw body>' using FLOWMEET_EVENT_SECRET. "
            "Timestamps more than five minutes from the server clock are rejected, which limits replays. Event ids are unique, so resending the same event is safe."
        ),
        "code_snippet": None,
        "url": "/docs#events",
    },
    {
        "id": "doc_limits",
        "title": "Rate limit and Firecrawl credit protection",
        "category": "operations",
        "keywords": ["rate", "limit", "429", "credits", "firecrawl", "cache", "abuse", "quota", "throttle"],
        "snippet": "The public demo allows 15 enrichments per hour per IP and caches scraped domains for 24 hours.",
        "content": (
            "The public demo endpoint allows 15 enrichments per hour per client IP. Domains scraped successfully are cached in memory for 24 hours, "
            "so repeated lookups cost no Firecrawl credits. The cache and the counters live in the web process and reset when it restarts. "
            "Firecrawl is only called when the built-in crawler cannot read a page."
        ),
        "code_snippet": None,
        "url": "/docs#limits",
    },
    {
        "id": "doc_self_host",
        "title": "Running Flowmeet yourself",
        "category": "deployment",
        "keywords": ["self-host", "deploy", "docker", "compose", "install", "quickstart", "env", "vps", "setup", "run"],
        "snippet": "Clone the repo, fill in .env, run docker compose up -d --build.",
        "content": (
            "Clone the repository, copy the environment variables you need into .env (Supabase keys, FLOWMEET_BOOKING_URL, and optionally RESEND_API_KEY and FIRECRAWL_API_KEY), "
            "then run 'docker compose up -d --build'. This starts the web app, the Rust crawler, the Go router and the Python docs search. "
            "Each service has a memory limit set in docker-compose.yml."
        ),
        "code_snippet": "git clone https://github.com/Emjaay20/Flowmeet.git\ncd Flowmeet/flowmeet\ndocker compose up -d --build",
        "url": "/docs#self-host",
    },
    {
        "id": "doc_connectors",
        "title": "CRM and analytics connectors",
        "category": "integrations",
        "keywords": ["hubspot", "salesforce", "ga4", "analytics", "klaviyo", "crm", "connector", "integration", "outbox", "queue"],
        "snippet": "HubSpot, Salesforce, GA4 and Klaviyo connectors exist in code but have not been verified against live accounts.",
        "content": (
            "Events stored by the webhook and events endpoints are forwarded by a worker (POST /api/integrations/process, protected by FLOWMEET_WORKER_SECRET) "
            "to HubSpot, Salesforce, Google Analytics 4 and Klaviyo, each only when its credentials are set. Results are saved per destination and retried with backoff. "
            "These connectors are written to the vendors' documented APIs but have not been tested end to end against live accounts. "
            "GA4 events are only sent when the visitor consented and a client id is present. Klaviyo events need marketing consent."
        ),
        "code_snippet": None,
        "url": "/docs#connectors",
    },
]
