"""
RAG Pipeline Orchestrator.
Main entry point for document ingestion, indexing, query execution, citation formatting, and safety checks.
"""

import time
from pathlib import Path
from typing import List, Dict, Any, Optional

from .config import settings
from .ingestion.loader import DocumentLoader, CanonicalDocument
from .chunking.structure_chunker import StructureChunker, DocumentChunk
from .embeddings.embedder import get_embedder
from .retrieval.vector_store import VectorStore
from .retrieval.hybrid import HybridRetriever
from .reranking.reranker import AuthorityReranker
from .citations.generator import CitationGenerator, Citation
from .safety.abstention import AbstentionEngine
from .safety.freshness import classify_freshness, FreshnessStatus
from .safety.grounding import GroundingValidator
from .safety.injection_defense import InjectionDefense
from .ingestion.validator import save_ingestion_report

class RAGPipeline:
    def __init__(
        self,
        store_path: Optional[Path] = None,
        embedding_provider: Optional[str] = None
    ):
        settings.ensure_directories()
        self.loader = DocumentLoader()
        self.chunker = StructureChunker(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            min_chunk_len=settings.min_chunk_len
        )
        self.embedder = get_embedder(provider=embedding_provider or settings.embedding_provider)
        self.vector_store = VectorStore(store_path=store_path or settings.vector_store_path, embedder=self.embedder)
        self.retriever = HybridRetriever(
            self.vector_store,
            dense_weight=settings.dense_weight,
            sparse_weight=settings.sparse_weight
        )
        self.reranker = AuthorityReranker()
        self.citator = CitationGenerator()
        self.abstention_engine = AbstentionEngine(min_similarity_threshold=settings.similarity_threshold)
        self.grounding_validator = GroundingValidator()
        self.injection_defense = InjectionDefense()

    def ingest_documents_from_directory(
        self,
        dir_path: Optional[Path] = None
    ) -> Dict[str, Any]:
        """
        Ingest all supported documents in target directory, chunk, embed, and store in vector index.
        Outputs artifacts/ingestion_report.json.
        """
        target_dir = Path(dir_path or settings.documents_dir)
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
            
        files = [f for f in target_dir.glob("*") if f.is_file()]
        
        seen_count = len(files)
        ingested_count = 0
        skipped_count = 0
        failed_count = 0
        total_pages = 0
        total_chunks = 0
        errors = []

        all_new_chunks: List[DocumentChunk] = []

        for f in files:
            try:
                doc = self.loader.load_file(f)
                if doc is None:
                    skipped_count += 1
                    continue
                
                chunks = self.chunker.chunk_document(doc)
                if not chunks:
                    skipped_count += 1
                    continue

                all_new_chunks.extend(chunks)
                ingested_count += 1
                total_pages += len(doc.pages)
                total_chunks += len(chunks)
            except Exception as e:
                failed_count += 1
                errors.append(f"{f.name}: {str(e)}")

        if all_new_chunks:
            self.vector_store.add_chunks(all_new_chunks)

        report = {
            "documents_seen": seen_count,
            "documents_ingested": ingested_count,
            "documents_skipped": skipped_count,
            "documents_failed": failed_count,
            "duplicates_detected": skipped_count,
            "pages_processed": total_pages,
            "chunks_created": total_chunks,
            "total_chunks_in_store": len(self.vector_store.chunks),
            "errors": errors
        }

        save_ingestion_report(report)
        return report

    def query(
        self,
        query_text: str,
        top_k: Optional[int] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Query the RAG pipeline. Executes hybrid retrieval, reranking, injection defense, abstention, and citation generation.
        """
        start_t = time.time()
        k = top_k or settings.top_k

        # 1. Retrieve candidates via Hybrid Search
        candidates = self.retriever.retrieve(query_text, top_k=k*2, filters=filters)

        # 2. Rerank by source authority & version
        reranked = self.reranker.rerank(candidates)

        # 3. Check Abstention
        abstention_eval = self.abstention_engine.evaluate_retrieval(reranked, query_text=query_text)

        if abstention_eval["should_abstain"]:
            latency_ms = (time.time() - start_t) * 1000.0
            return {
                "query": query_text,
                "answer": abstention_eval["message"],
                "should_abstain": True,
                "confidence_level": "LOW",
                "citations": [],
                "chunks": [],
                "freshness": FreshnessStatus.UNKNOWN,
                "latency_ms": round(latency_ms, 2)
            }

        valid_tuples = [(c, s) for c, s in reranked if s >= settings.similarity_threshold][:k]
        chunks = [c for c, s in valid_tuples]

        # 4. Injection Defense on retrieved text
        sanitized_chunks = self.injection_defense.sanitize_chunks(chunks)

        # 5. Generate Citations
        citations = self.citator.generate_citations(sanitized_chunks)

        # 6. Freshness Check
        freshness = FreshnessStatus.CURRENT
        if sanitized_chunks:
            freshness = classify_freshness(sanitized_chunks[0].effective_date or sanitized_chunks[0].publication_date)

        # 7. Format Synthesized Answer with Citations
        context_parts = []
        for idx, chunk in enumerate(sanitized_chunks):
            cit_label = f"[{idx+1}]"
            context_parts.append(f"{cit_label} ({chunk.title} - Page {chunk.page_number}): {chunk.content.strip()}")
            
        synthesized_answer = (
            f"Based on official sources, here is the verified information:\n\n"
            + "\n\n".join(context_parts)
            + f"\n\nFreshness Status: {freshness.value}"
        )

        latency_ms = (time.time() - start_t) * 1000.0

        return {
            "query": query_text,
            "answer": synthesized_answer,
            "should_abstain": False,
            "confidence_level": abstention_eval["confidence_level"],
            "citations": [c.model_dump() for c in citations],
            "chunks": [c.model_dump() for c in sanitized_chunks],
            "freshness": freshness.value,
            "latency_ms": round(latency_ms, 2)
        }
