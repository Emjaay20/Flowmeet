"""
Flowmeet docs search service (port 8083).

Answers a question with the best-matching documentation entry and its
citation, or says a person should answer when nothing matches well.
"""

import time
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import DeflectRequest, DeflectResponse, SearchRequest, HealthResponse
from rag_engine import rag_engine, KNOWLEDGE_DOCUMENTS

app = FastAPI(
    title="Flowmeet docs search",
    description="TF-IDF search over the Flowmeet documentation.",
    version="2.0.0"
)

# Enable CORS for Next.js frontend calls and external webhooks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()
PROCESSED_QUERIES = 0
DEFLECTED_QUERIES = 0

@app.get("/", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health():
    """Operational liveness probe and memory telemetry."""
    return HealthResponse(
        status="ok",
        service="flowmeet-docs-search",
        version="2.0.0",
        engine="FastAPI + TF-IDF",
        indexed_documents=len(KNOWLEDGE_DOCUMENTS),
    )

@app.post("/ai/deflect", response_model=DeflectResponse)
def deflect_ticket(payload: DeflectRequest):
    """
    Evaluates incoming customer technical inquiries, retrieves matching verified
    documentation, and resolves Level-1 tickets autonomously.
    """
    global PROCESSED_QUERIES, DEFLECTED_QUERIES
    PROCESSED_QUERIES += 1

    if not payload.query or len(payload.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query parameter must be at least 3 characters")

    res = rag_engine.evaluate_deflection(
        query=payload.query,
        customer_tier=payload.customer_tier or "STANDARD",
        company=payload.company or "Unknown"
    )

    if res.resolution_status == "AUTONOMOUS_DEFLECTION_SUCCESS":
        DEFLECTED_QUERIES += 1

    return res

@app.post("/ai/search")
def search_docs(payload: SearchRequest):
    """Direct semantic document search endpoint."""
    results = rag_engine.search(payload.query, top_k=payload.top_k)
    return {
        "query": payload.query,
        "count": len(results),
        "matches": [
            {
                "id": doc["id"],
                "title": doc["title"],
                "relevance_score": score,
                "url": doc["url"],
                "snippet": doc["snippet"],
                "code_snippet": doc.get("code_snippet")
            }
            for doc, score in results
        ]
    }

@app.get("/ai/stats")
def stats():
    """Counters since the process started. Nothing is seeded."""
    return {
        "uptime_seconds": int(time.time() - START_TIME),
        "questions_seen": PROCESSED_QUERIES,
        "answered_from_docs": DEFLECTED_QUERIES,
        "answer_rate_percent": round(DEFLECTED_QUERIES / PROCESSED_QUERIES * 100, 1) if PROCESSED_QUERIES else None,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=False)
