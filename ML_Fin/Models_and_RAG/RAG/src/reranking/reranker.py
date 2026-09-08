"""
Source-Aware Reranker & Conflict Resolution Module.
Reranks retrieved candidate chunks based on source authority level, document recency, and semantic relevance.
"""

from typing import List, Tuple
from ..chunking.structure_chunker import DocumentChunk
from ..ingestion.authority import SourceAuthorityLevel, get_authority_weight

class AuthorityReranker:
    """
    Reranks document chunks prioritizing higher authority levels and active document versions.
    Level 1 (Central Govt) > Level 2 (State Govt) > Level 3 (Public Inst) > Level 4 (Other)
    """
    def rerank(self, candidates: List[Tuple[DocumentChunk, float]]) -> List[Tuple[DocumentChunk, float]]:
        if not candidates:
            return []
            
        reranked = []
        for chunk, base_score in candidates:
            auth_weight = get_authority_weight(SourceAuthorityLevel(chunk.source_authority_level))
            
            # Version multiplier
            version_boost = 1.0 + (chunk.version - 1) * 0.05
            
            final_score = base_score * auth_weight * version_boost
            reranked.append((chunk, float(final_score)))
            
        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked
