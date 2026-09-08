"""
Citation Generator & Metadata Verification Engine.
Produces verifiable, non-fabricated citations for retrieved RAG chunks.
"""

from typing import List, Dict, Any
from pydantic import BaseModel
from ..chunking.structure_chunker import DocumentChunk

class Citation(BaseModel):
    citation_id: str
    document_id: str
    title: str
    source: str
    publisher: str
    department: str
    page_number: int
    section: str
    source_url: str
    source_authority_level: int
    version: int
    formatted_text: str

class CitationGenerator:
    def generate_citations(self, chunks: List[DocumentChunk]) -> List[Citation]:
        """Convert retrieved DocumentChunks into structured Citations."""
        citations = []
        seen = set()
        
        for idx, c in enumerate(chunks):
            key = (c.document_id, c.page_number, c.heading)
            if key in seen:
                continue
            seen.add(key)
            
            c_id = f"[{idx+1}]"
            fmt = f"{c_id} {c.title} ({c.publisher}/{c.department}) - Page {c.page_number}, Section '{c.heading}'"
            if c.source_url:
                fmt += f" [URL: {c.source_url}]"
                
            citations.append(Citation(
                citation_id=c_id,
                document_id=c.document_id,
                title=c.title,
                source=c.source,
                publisher=c.publisher,
                department=c.department,
                page_number=c.page_number,
                section=c.heading,
                source_url=c.source_url,
                source_authority_level=c.source_authority_level,
                version=c.version,
                formatted_text=fmt
            ))
            
        return citations
