"""
Hybrid Retrieval Engine.
Combines Dense Cosine Similarity and Sparse Keyword Matching with Source Authority Weighting.
"""

import math
from typing import List, Tuple, Dict, Any, Optional
from ..chunking.structure_chunker import DocumentChunk
from ..ingestion.authority import SourceAuthorityLevel, get_authority_weight
from .vector_store import VectorStore

class HybridRetriever:
    def __init__(self, vector_store: VectorStore, dense_weight: float = 0.6, sparse_weight: float = 0.4):
        self.vector_store = vector_store
        self.dense_weight = dense_weight
        self.sparse_weight = sparse_weight

    def _bm25_sparse_score(self, query: str, chunk_content: str) -> float:
        """Compute lightweight BM25-style keyword overlap score."""
        q_terms = set(query.lower().split())
        if not q_terms:
            return 0.0
            
        c_terms = chunk_content.lower().split()
        if not c_terms:
            return 0.0
            
        score = 0.0
        doc_len = len(c_terms)
        
        for term in q_terms:
            freq = c_terms.count(term)
            if freq > 0:
                # Simple BM25 TF component formula
                tf = (freq * 2.2) / (freq + 1.2 * (0.25 + 0.75 * (doc_len / 100.0)))
                score += tf
                
        return score / max(1, len(q_terms))

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        apply_authority_boost: bool = True
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Execute Hybrid Retrieval returning top-k ranked chunks with scores.
        """
        dense_results = self.vector_store.search(query, top_k=top_k*3, filters=filters)
        if not dense_results:
            return []
            
        hybrid_results: List[Tuple[DocumentChunk, float]] = []
        
        for chunk, dense_score in dense_results:
            sparse_score = self._bm25_sparse_score(query, chunk.content)
            
            # Combine dense and sparse scores without penalizing strong dense matches
            combined_score = max(dense_score, (self.dense_weight * dense_score) + (self.sparse_weight * sparse_score))
            
            # Apply Source Authority multiplier
            if apply_authority_boost:
                auth_level = SourceAuthorityLevel(chunk.source_authority_level)
                weight = get_authority_weight(auth_level)
                combined_score *= weight
                
            hybrid_results.append((chunk, combined_score))
            
        hybrid_results.sort(key=lambda x: x[1], reverse=True)
        return hybrid_results[:top_k]
