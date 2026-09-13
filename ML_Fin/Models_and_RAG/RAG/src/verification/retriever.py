"""
RAG Retrieval Engine for Business Regulations Verification.

Uses BAAI/bge-large-en-v1.5 — the same model used during ingestion —
to embed queries and perform cosine similarity search against the
ChromaDB 'business_regulations' collection (3,994 chunks).

Metadata per chunk:
  - document_name: str  (source PDF filename)
  - topic: str          (detected regulation heading / section)
  - source_type: str    ("business_regulation")
  - chunk_index: int    (position in document)
"""

from pathlib import Path
from typing import Optional
import chromadb
from sentence_transformers import SentenceTransformer

# ──────────────────────────────────────────────────────────────
# Constants (must match ingestion configuration)
# ──────────────────────────────────────────────────────────────
EMBED_MODEL_NAME = "BAAI/bge-large-en-v1.5"
COLLECTION_NAME = "business_regulations"
CHROMA_DIR = Path(__file__).resolve().parent.parent.parent / "chroma_db"


class BusinessRegulationRetriever:
    """
    Singleton retriever backed by ChromaDB + BAAI/bge-large-en-v1.5.

    Usage:
        retriever = BusinessRegulationRetriever()
        results = retriever.search("PMEGP subsidy eligibility rural", top_k=4)
    """

    _instance = None

    def __new__(cls):
        """Singleton pattern to load model only once per process."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        print(f"[Retriever] Loading embedding model: {EMBED_MODEL_NAME}")
        self.model = SentenceTransformer(EMBED_MODEL_NAME)

        print(f"[Retriever] Connecting to ChromaDB at: {CHROMA_DIR}")
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.collection = self.client.get_collection(name=COLLECTION_NAME)

        count = self.collection.count()
        print(f"[Retriever] Ready — {count} chunks indexed in '{COLLECTION_NAME}'.")

        self._initialized = True

    def search(
        self,
        query: str,
        top_k: int = 5,
        topic_filter: Optional[str] = None,
    ) -> list[dict]:
        """
        Embed the query with BAAI/bge-large-en-v1.5 and retrieve
        the top-K most relevant regulation chunks via cosine similarity.

        Args:
            query:        Natural-language verification question.
            top_k:        Number of chunks to return.
            topic_filter: Optional regulation topic substring filter.

        Returns:
            List of dicts with keys:
              - rank (int)
              - score (float)   — higher = more relevant
              - text (str)      — chunk content
              - document_name (str)
              - topic (str)
              - chunk_index (int)
              - source_type (str)
        """
        # BGE models benefit from this instruction prefix at query time
        prefixed_query = f"Represent this sentence for searching relevant passages: {query}"

        query_embedding = self.model.encode(
            prefixed_query,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).tolist()

        where_filter = None
        if topic_filter:
            where_filter = {"topic": {"$contains": topic_filter.upper()}}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        output = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]  # cosine distance; lower = more similar

        for rank, (doc, meta, dist) in enumerate(zip(docs, metas, dists), start=1):
            # Convert cosine distance → similarity score in [0,1]
            similarity = round(1.0 - dist, 4)
            output.append({
                "rank": rank,
                "score": similarity,
                "text": doc,
                "document_name": meta.get("document_name", "unknown"),
                "topic": meta.get("topic", "GENERAL"),
                "chunk_index": meta.get("chunk_index", -1),
                "source_type": meta.get("source_type", "business_regulation"),
            })

        return output


# ──────────────────────────────────────────────────────────────
# Module-level singleton for import reuse
# ──────────────────────────────────────────────────────────────
_retriever: Optional[BusinessRegulationRetriever] = None


def get_retriever() -> BusinessRegulationRetriever:
    """Return the module-level singleton retriever instance."""
    global _retriever
    if _retriever is None:
        _retriever = BusinessRegulationRetriever()
    return _retriever
