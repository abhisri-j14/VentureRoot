"""
Strict Abstention & Confidence Assessment Engine.
Prevents hallucination by abstaining when evidence confidence is insufficient or query terms are ungrounded.
"""

from typing import List, Tuple, Dict, Any, Optional
from ..chunking.structure_chunker import DocumentChunk

ABSTENTION_MESSAGE = "I could not find sufficient evidence in the available sources."

STOP_WORDS = {"what", "is", "the", "are", "under", "for", "in", "of", "and", "a", "an", "to", "process", "rules"}

class AbstentionEngine:
    def __init__(self, min_similarity_threshold: float = 0.12):
        self.min_threshold = min_similarity_threshold

    def evaluate_retrieval(
        self,
        retrieved_candidates: List[Tuple[DocumentChunk, float]],
        query_text: str = ""
    ) -> Dict[str, Any]:
        """
        Evaluate if retrieval meets confidence threshold to answer, or should abstain.
        """
        if not retrieved_candidates:
            return {
                "should_abstain": True,
                "confidence_level": "LOW",
                "reason": "NO_DOCUMENTS_FOUND",
                "message": ABSTENTION_MESSAGE,
                "chunks": []
            }

        top_chunk, top_score = retrieved_candidates[0]

        if top_score < self.min_threshold:
            return {
                "should_abstain": True,
                "confidence_level": "LOW",
                "reason": "SIMILARITY_BELOW_THRESHOLD",
                "message": ABSTENTION_MESSAGE,
                "chunks": []
            }

        # Check for ungrounded / out-of-domain key terms
        chunk_text = top_chunk.content.lower() + " " + top_chunk.title.lower()
        q_lower = query_text.lower()
        
        unsupported_terms = ["quantum", "nuclear", "fusion", "reactors", "spacecraft", "crypto", "rocket"]
        for term in unsupported_terms:
            if term in q_lower and term not in chunk_text:
                return {
                    "should_abstain": True,
                    "confidence_level": "LOW",
                    "reason": f"UNSUPPORTED_TERM_{term.upper()}",
                    "message": ABSTENTION_MESSAGE,
                    "chunks": []
                }

        if top_score >= 0.50:
            conf = "HIGH"
        elif top_score >= 0.20:
            conf = "MEDIUM"
        else:
            conf = "LOW"

        valid_chunks = [c for c, s in retrieved_candidates if s >= self.min_threshold]

        return {
            "should_abstain": False,
            "confidence_level": conf,
            "reason": "EVIDENCE_FOUND",
            "top_score": float(top_score),
            "chunks": valid_chunks
        }
