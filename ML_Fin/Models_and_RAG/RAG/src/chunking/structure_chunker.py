"""
Structure-Aware Document Chunker.
Splits canonical documents by headings, paragraphs, and sections while preserving document hierarchy & page lineage.
"""

import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from ..ingestion.loader import CanonicalDocument
from ..ingestion.hasher import compute_text_sha256

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    source: str
    source_url: str = ""
    publisher: str = ""
    department: str = ""
    state: str = ""
    category: str = ""
    effective_date: str = ""
    publication_date: str = ""
    source_authority_level: int = 1
    version: int = 1
    page_number: int = 1
    heading: str = ""
    section: str = ""
    content: str
    chunk_hash: str
    token_estimate: int = 0

class StructureChunker:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50, min_chunk_len: int = 30):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_len = min_chunk_len

    def _split_into_paragraphs(self, text: str) -> List[Dict[str, str]]:
        """Identify headings and paragraphs from text."""
        lines = text.split("\n")
        blocks = []
        current_heading = "General Overview"
        current_lines = []

        heading_pattern = re.compile(r"^(#+|SECTION|CHAPTER|ELIGIBILITY|SUBSIDY|FINANCIAL ASSISTANCE|DOCUMENTS REQUIRED|PROCEDURE|NOTE:|\d+\.|\w+:)", re.IGNORECASE)

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            if heading_pattern.match(line_str) and len(line_str) < 80:
                if current_lines:
                    blocks.append({"heading": current_heading, "text": " ".join(current_lines)})
                    current_lines = []
                current_heading = line_str.lstrip("#").strip()
            else:
                current_lines.append(line_str)

        if current_lines:
            blocks.append({"heading": current_heading, "text": " ".join(current_lines)})

        return blocks

    def chunk_document(self, doc: CanonicalDocument) -> List[DocumentChunk]:
        """Convert CanonicalDocument into structure-aware DocumentChunks."""
        chunks: List[DocumentChunk] = []
        seen_hashes = set()

        meta = doc.metadata

        for page in doc.pages:
            blocks = self._split_into_paragraphs(page.text)
            for b in blocks:
                heading = b["heading"]
                text = b["text"]
                
                # Split large text block by words using sliding window
                words = text.split()
                if not words:
                    continue

                if len(words) * 6 <= self.chunk_size:
                    # Single chunk for this block
                    c_text = f"[{meta.title} - {heading}]\n{text}"
                    c_hash = compute_text_sha256(c_text)
                    if c_hash not in seen_hashes and len(c_text.strip()) >= self.min_chunk_len:
                        seen_hashes.add(c_hash)
                        chunks.append(DocumentChunk(
                            chunk_id=f"{meta.document_id}_p{page.page_number}_c{len(chunks)+1}",
                            document_id=meta.document_id,
                            title=meta.title,
                            source=meta.source,
                            source_url=meta.source_url,
                            publisher=meta.publisher,
                            department=meta.department,
                            state=meta.state,
                            category=meta.category,
                            effective_date=meta.effective_date,
                            publication_date=meta.publication_date,
                            source_authority_level=meta.source_authority_level,
                            version=meta.version,
                            page_number=page.page_number,
                            heading=heading,
                            section=heading,
                            content=c_text,
                            chunk_hash=c_hash,
                            token_estimate=len(words)
                        ))
                else:
                    # Sliding window chunking
                    step = max(1, (self.chunk_size - self.chunk_overlap) // 6)
                    target_words = self.chunk_size // 6
                    
                    for i in range(0, len(words), step):
                        sub_words = words[i:i + target_words]
                        if not sub_words:
                            break
                        sub_text = " ".join(sub_words)
                        c_text = f"[{meta.title} - {heading}]\n{sub_text}"
                        c_hash = compute_text_sha256(c_text)
                        
                        if c_hash not in seen_hashes and len(c_text.strip()) >= self.min_chunk_len:
                            seen_hashes.add(c_hash)
                            chunks.append(DocumentChunk(
                                chunk_id=f"{meta.document_id}_p{page.page_number}_c{len(chunks)+1}",
                                document_id=meta.document_id,
                                title=meta.title,
                                source=meta.source,
                                source_url=meta.source_url,
                                publisher=meta.publisher,
                                department=meta.department,
                                state=meta.state,
                                category=meta.category,
                                effective_date=meta.effective_date,
                                publication_date=meta.publication_date,
                                source_authority_level=meta.source_authority_level,
                                version=meta.version,
                                page_number=page.page_number,
                                heading=heading,
                                section=heading,
                                content=c_text,
                                chunk_hash=c_hash,
                                token_estimate=len(sub_words)
                            ))
                            
        return chunks
