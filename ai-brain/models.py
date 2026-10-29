from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DeflectRequest(BaseModel):
    query: str = Field(..., description="The user or customer technical question/ticket")
    customer_tier: Optional[str] = Field(default="STANDARD", description="ENTERPRISE, MID_MARKET, or STANDARD")
    company: Optional[str] = Field(default="Unknown", description="Company asking the question")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata (e.g. system logs, error code)")

class DocCitation(BaseModel):
    doc_id: str
    title: str
    section: str
    relevance_score: float
    snippet: str
    documentation_url: str

class DeflectResponse(BaseModel):
    status: int = 200
    query: str
    resolution_status: str  # "AUTONOMOUS_DEFLECTION_SUCCESS" or "HUMAN_ESCALATION_RECOMMENDED"
    confidence_score: float  # 0.0 - 100.0
    direct_answer: str
    recommended_code_snippet: Optional[str] = None
    citations: List[DocCitation]
    saved_support_minutes: int
    execution_time_ms: float
    timestamp: datetime
    worker_node: str

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    engine: str
    indexed_documents: int
    ram_target: str
    average_deflection_latency_ms: float
