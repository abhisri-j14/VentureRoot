"""
Persistent Local Vector Store & Indexing Engine.
Manages chunk storage, vector indexing, metadata filtering, and persistence.
"""

import pickle
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from ..chunking.structure_chunker import DocumentChunk
from ..embeddings.embedder import TFIDFEmbedder, BaseEmbedder, get_embedder

class VectorStore:
    def __init__(self, store_path: Optional[Path] = None, embedder: Optional[BaseEmbedder] = None):
        if store_path is None:
            from ..config import settings
            store_path = settings.vector_store_path
            
        self.store_path = Path(store_path)
        self.embedder = embedder or get_embedder()
        self.chunks: List[DocumentChunk] = []
        self.vectors: Optional[np.ndarray] = None
        self.load()

    def add_chunks(self, chunks: List[DocumentChunk]):
        """Add new chunks, generate embeddings, and update index."""
        if not chunks:
            return
            
        # Deduplicate chunks against existing by chunk_hash
        existing_hashes = {c.chunk_hash for c in self.chunks}
        new_chunks = [c for c in chunks if c.chunk_hash not in existing_hashes]
        
        if not new_chunks:
            return
            
        self.chunks.extend(new_chunks)
        all_texts = [c.content for c in self.chunks]
        
        if isinstance(self.embedder, TFIDFEmbedder):
            self.vectors = self.embedder.fit_embed_texts(all_texts)
        else:
            self.vectors = self.embedder.embed_texts(all_texts)
            
        self.save()

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Search vector index with cosine similarity and optional metadata filtering.
        """
        if not self.chunks or self.vectors is None or len(self.chunks) == 0:
            return []
            
        query_vec = self.embedder.embed_query(query)
        if np.all(query_vec == 0):
            # Fallback uniform similarity if query vector is zero
            sims = np.zeros(len(self.chunks))
        else:
            # Cosine similarity for normalized vectors: dot product
            sims = np.dot(self.vectors, query_vec)
            
        results: List[Tuple[DocumentChunk, float]] = []
        
        for idx, (chunk, sim) in enumerate(zip(self.chunks, sims)):
            # Apply metadata filters
            if filters:
                match = True
                for k, v in filters.items():
                    attr_val = getattr(chunk, k, None)
                    if attr_val is not None:
                        if isinstance(v, list):
                            if attr_val not in v:
                                match = False; break
                        elif attr_val != v:
                            match = False; break
                if not match:
                    continue
                    
            results.append((chunk, float(sim)))
            
        # Sort by similarity score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def save(self):
        """Persist vector store index to disk."""
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "chunks": [c.model_dump() for c in self.chunks],
            "vectors": self.vectors,
            "embedder": self.embedder
        }
        with open(self.store_path, "wb") as f:
            pickle.dump(data, f)

    def load(self):
        """Load vector store index from disk if exists, auto-reindexing if missing/corrupt."""
        loaded = False
        if self.store_path.exists():
            try:
                with open(self.store_path, "rb") as f:
                    data = pickle.load(f)
                self.chunks = [DocumentChunk(**c) for c in data.get("chunks", [])]
                self.vectors = data.get("vectors")
                if data.get("embedder"):
                    self.embedder = data["embedder"]
                if len(self.chunks) > 0 and self.vectors is not None:
                    loaded = True
            except Exception:
                self.chunks = []
                self.vectors = None

        from ..config import settings
        is_default_path = False
        try:
            is_default_path = (self.store_path.resolve() == settings.vector_store_path.resolve())
        except Exception:
            pass

        if (not loaded or len(self.chunks) == 0) and is_default_path:
            # Auto-reindex from official documents directory
            try:
                from ..ingestion.loader import DocumentLoader
                from ..chunking.structure_chunker import StructureChunker
                docs_dir = settings.documents_dir
                if docs_dir.exists():
                    loader = DocumentLoader()
                    chunker = StructureChunker(
                        chunk_size=settings.chunk_size,
                        chunk_overlap=settings.chunk_overlap,
                        min_chunk_len=settings.min_chunk_len
                    )
                    all_chunks = []
                    for f in sorted(docs_dir.glob("*")):
                        if f.is_file():
                            doc = loader.load_file(f)
                            if doc:
                                chs = chunker.chunk_document(doc)
                                if chs:
                                    all_chunks.extend(chs)
                    if all_chunks:
                        self.add_chunks(all_chunks)
            except Exception:
                pass
