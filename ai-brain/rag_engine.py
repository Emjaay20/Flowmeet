"""
Flowmeet docs search.

TF-IDF cosine similarity over a small in-memory list of documents, plus a
keyword boost. There are no embeddings and no language model. The score is a
relevance score scaled to 0-100, not a probability.
"""

import math
import re
import time
from typing import List, Tuple, Dict, Any
from knowledge_base import KNOWLEDGE_DOCUMENTS
from models import DocCitation, DeflectResponse

# Common English stopwords to strip for high-signal token matching
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
    "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into filtered lowercase terms and n-grams."""
    cleaned = re.sub(r"[^\w\s-]", " ", text.lower())
    tokens = [t for t in cleaned.split() if len(t) > 1 and t not in STOPWORDS]
    return tokens

# Hand-set thresholds, tuned on a handful of questions. Below the floor nothing
# is returned; between the floor and the threshold the match is shown but the
# question is still marked for a person.
ANSWER_FLOOR = 35.0
ANSWER_THRESHOLD = 40.0


class SemanticRAGEngine:
    def __init__(self, docs: List[Dict[str, Any]]):
        self.docs = docs
        self.doc_index: List[Dict[str, Any]] = []
        self._build_index()

    def _build_index(self):
        """Index documents with term frequency (TF) and inverse document frequency (IDF)."""
        num_docs = len(self.docs)
        doc_freq: Dict[str, int] = {}

        for doc in self.docs:
            combined_text = f"{doc['title']} {' '.join(doc['keywords'])} {doc['snippet']} {doc['content']}"
            tokens = tokenize(combined_text)
            term_counts: Dict[str, int] = {}
            for t in tokens:
                term_counts[t] = term_counts.get(t, 0) + 1

            total_terms = max(1, len(tokens))
            tf = {t: count / total_terms for t, count in term_counts.items()}
            
            for t in set(tokens):
                doc_freq[t] = doc_freq.get(t, 0) + 1

            self.doc_index.append({
                "doc": doc,
                "tf": tf,
                "tokens": set(tokens),
                "total_terms": total_terms
            })

        # Calculate IDF
        self.idf: Dict[str, float] = {}
        for term, df in doc_freq.items():
            self.idf[term] = math.log((num_docs + 1) / (df + 1)) + 1.0

    def search(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Compute cosine similarity between query and indexed documents."""
        q_tokens = tokenize(query)
        if not q_tokens:
            return []

        q_term_counts: Dict[str, int] = {}
        for t in q_tokens:
            q_term_counts[t] = q_term_counts.get(t, 0) + 1

        total_q = len(q_tokens)
        q_vec: Dict[str, float] = {}
        for t, count in q_term_counts.items():
            tf = count / total_q
            idf = self.idf.get(t, 1.0)
            q_vec[t] = tf * idf

        q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0

        scores: List[Tuple[Dict[str, Any], float]] = []

        for item in self.doc_index:
            doc = item["doc"]
            tf = item["tf"]
            dot_product = 0.0

            # Calculate keyword boost
            keyword_overlap = sum(2.0 for k in doc.get("keywords", []) if k in query.lower())

            for t, q_weight in q_vec.items():
                if t in tf:
                    doc_weight = tf[t] * self.idf.get(t, 1.0)
                    dot_product += q_weight * doc_weight

            doc_norm = math.sqrt(sum((w * self.idf.get(t, 1.0)) ** 2 for t, w in tf.items())) or 1.0
            cosine_sim = dot_product / (q_norm * doc_norm)
            
            # Combine cosine similarity + keyword boost, mapped to 0-100 scale
            final_score = min(99.5, (cosine_sim * 65.0) + (keyword_overlap * 7.5))
            if final_score > 10.0:
                scores.append((doc, round(final_score, 1)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def evaluate_deflection(self, query: str, customer_tier: str = "STANDARD", company: str = "Unknown") -> DeflectResponse:
        """Run autonomous Level-1 ticket deflection evaluation."""
        start_time = time.time()
        results = self.search(query, top_k=2)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        if not results or results[0][1] < ANSWER_FLOOR:
            # Low confidence - escalate to human solutions architect
            return DeflectResponse(
                status=200,
                query=query,
                resolution_status="HUMAN_ESCALATION_RECOMMENDED",
                confidence_score=results[0][1] if results else 0.0,
                direct_answer=(
                    "No document matched this question well enough to answer it. "
                    "A person should take this one."
                ),
                recommended_code_snippet=None,
                citations=[],
                execution_time_ms=elapsed_ms,
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                worker_node="flowmeet-docs-search"
            )

        top_doc, top_score = results[0]
        
        # Build Citations
        citations = []
        for doc, score in results:
            citations.append(DocCitation(
                doc_id=doc["id"],
                title=doc["title"],
                section=doc["category"].upper(),
                relevance_score=score,
                snippet=doc["snippet"],
                documentation_url=doc["url"]
            ))

        # Autonomous resolution response
        resolution_status = "AUTONOMOUS_DEFLECTION_SUCCESS" if top_score >= ANSWER_THRESHOLD else "HUMAN_ESCALATION_RECOMMENDED"
        
        answer = (
            f"{top_doc['title']}\n\n"
            f"{top_doc['content']}\n\n"
            f"More: {top_doc['url']}"
        )

        return DeflectResponse(
            status=200,
            query=query,
            resolution_status=resolution_status,
            confidence_score=top_score,
            direct_answer=answer,
            recommended_code_snippet=top_doc.get("code_snippet"),
            citations=citations,
            execution_time_ms=elapsed_ms,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            worker_node="flowmeet-docs-search"
        )

# Global engine instance
rag_engine = SemanticRAGEngine(KNOWLEDGE_DOCUMENTS)
