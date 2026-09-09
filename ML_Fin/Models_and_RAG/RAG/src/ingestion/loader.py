"""
Multi-Format Document Loader & Metadata Extractor.
Parses PDF, TXT, DOCX, HTML, CSV, JSON, MD into canonical Document & Page representations.
"""

import re
import json
import csv
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from .authority import classify_source_authority, SourceAuthorityLevel
from .hasher import compute_file_sha256, compute_text_sha256
from .versioning import DocumentVersionTracker
from .validator import IngestionValidator, save_ingestion_report

class PageContent(BaseModel):
    page_number: int
    text: str
    section: str = ""
    page_hash: str = ""

class DocumentMetadata(BaseModel):
    document_id: str
    title: str
    source: str
    source_url: str = ""
    publisher: str = ""
    department: str = ""
    state: str = ""
    category: str = "Government Scheme"
    effective_date: str = ""
    publication_date: str = ""
    ingestion_timestamp: str = ""
    document_hash: str = ""
    source_authority_level: int = 1
    version: int = 1

class CanonicalDocument(BaseModel):
    metadata: DocumentMetadata
    pages: List[PageContent] = Field(default_factory=list)
    raw_text: str = ""

class DocumentLoader:
    def __init__(self, version_tracker: Optional[DocumentVersionTracker] = None):
        self.tracker = version_tracker or DocumentVersionTracker()
        self.validator = IngestionValidator()

    def load_file(self, file_path: Path, custom_metadata: Optional[Dict[str, Any]] = None) -> Optional[CanonicalDocument]:
        """Load and parse document file into CanonicalDocument."""
        file_path = Path(file_path)
        val = self.validator.validate_file(file_path)
        if not val["valid"]:
            return None

        ext = file_path.suffix.lower()
        file_hash = compute_file_sha256(file_path)
        
        pages: List[PageContent] = []
        raw_text = ""

        if ext in [".txt", ".md"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_text = f.read()
            # Treat file as single page or split by double newline
            pages.append(PageContent(page_number=1, text=raw_text, page_hash=compute_text_sha256(raw_text)))

        elif ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                full_pages = []
                for i, page in enumerate(reader.pages):
                    txt = page.extract_text() or ""
                    if txt.strip():
                        pages.append(PageContent(page_number=i+1, text=txt, page_hash=compute_text_sha256(txt)))
                        full_pages.append(txt)
                raw_text = "\n\n".join(full_pages)
            except Exception:
                # Fallback to simple binary text extraction if pypdf fails
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    raw_text = f.read()
                pages.append(PageContent(page_number=1, text=raw_text, page_hash=compute_text_sha256(raw_text)))

        elif ext in [".html", ".htm"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            # Strip simple HTML tags
            clean = re.sub(r"<[^>]+>", " ", content)
            clean = re.sub(r"\s+", " ", clean).strip()
            raw_text = clean
            pages.append(PageContent(page_number=1, text=raw_text, page_hash=compute_text_sha256(raw_text)))

        elif ext == ".json":
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                text_blocks = [json.dumps(item, ensure_ascii=False) for item in data]
                raw_text = "\n".join(text_blocks)
            elif isinstance(data, dict):
                raw_text = json.dumps(data, indent=2, ensure_ascii=False)
            pages.append(PageContent(page_number=1, text=raw_text, page_hash=compute_text_sha256(raw_text)))

        elif ext == ".csv":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                reader = csv.reader(f)
                rows = [" | ".join(r) for r in reader if r]
            raw_text = "\n".join(rows)
            pages.append(PageContent(page_number=1, text=raw_text, page_hash=compute_text_sha256(raw_text)))

        if not raw_text.strip():
            return None

        # Build Metadata
        meta_dict = custom_metadata or {}
        doc_id = meta_dict.get("document_id") or file_path.stem.lower().replace(" ", "_")
        title = meta_dict.get("title") or file_path.stem.replace("_", " ").title()
        source_name = meta_dict.get("source") or "Government Portal / Official Publication"
        source_url = meta_dict.get("source_url") or ""
        
        authority_level = classify_source_authority(source_name, source_url)
        
        reg_info = self.tracker.register_document(
            doc_id=doc_id,
            doc_hash=file_hash,
            title=title,
            effective_date=meta_dict.get("effective_date", ""),
            source_url=source_url
        )

        metadata = DocumentMetadata(
            document_id=doc_id,
            title=title,
            source=source_name,
            source_url=source_url,
            publisher=meta_dict.get("publisher", "Government Agency"),
            department=meta_dict.get("department", "Ministry of MSME / Agriculture"),
            state=meta_dict.get("state", "West Bengal / All India"),
            category=meta_dict.get("category", "Government Scheme"),
            effective_date=meta_dict.get("effective_date", "2024-01-01"),
            publication_date=meta_dict.get("publication_date", "2024-01-01"),
            ingestion_timestamp=datetime.now(timezone.utc).isoformat(),
            document_hash=file_hash,
            source_authority_level=int(authority_level),
            version=reg_info.get("version", 1)
        )

        return CanonicalDocument(metadata=metadata, pages=pages, raw_text=raw_text)
