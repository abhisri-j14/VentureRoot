"""
RAG Grounding & Support Verification Engine.
Categorizes claims as SUPPORTED_BY_SOURCE, PARTIALLY_SUPPORTED, MODEL_INFERENCE, or NOT_FOUND.
"""

from enum import Enum
from typing import List, Dict, Any
from ..chunking.structure_chunker import DocumentChunk

class SupportStatus(str, Enum):
    SUPPORTED_BY_SOURCE = "SUPPORTED_BY_SOURCE"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    MODEL_INFERENCE = "MODEL_INFERENCE"
    NOT_FOUND = "NOT_FOUND"

class GroundingValidator:
    def verify_grounding(self, claim: str, retrieved_chunks: List[DocumentChunk]) -> SupportStatus:
        """
        Verify whether a claim is grounded in retrieved chunks.
        """
        if not retrieved_chunks:
            return SupportStatus.NOT_FOUND

        claim_terms = set(claim.lower().split())
        if not claim_terms:
            return SupportStatus.NOT_FOUND

        best_overlap = 0.0
        for chunk in retrieved_chunks:
            c_terms = set(chunk.content.lower().split())
            overlap = len(claim_terms.intersection(c_terms)) / len(claim_terms)
            if overlap > best_overlap:
                best_overlap = overlap

        if best_overlap >= 0.70:
            return SupportStatus.SUPPORTED_BY_SOURCE
        elif best_overlap >= 0.40:
            return SupportStatus.PARTIALLY_SUPPORTED
        elif best_overlap > 0.10:
            return SupportStatus.MODEL_INFERENCE
        else:
            return SupportStatus.NOT_FOUND
