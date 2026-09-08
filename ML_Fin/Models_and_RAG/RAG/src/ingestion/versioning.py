"""
Document Versioning & Lineage Management.
Tracks document versions, detects updates, and preserves historical versions.
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from .hasher import compute_text_sha256

class DocumentVersionTracker:
    def __init__(self, registry_file: Optional[Path] = None):
        if registry_file is None:
            from ..config import settings
            registry_file = settings.processed_dir / "document_registry.json"
        self.registry_file = Path(registry_file)
        self.registry: Dict[str, Dict[str, Any]] = self._load()

    def _load(self) -> Dict[str, Dict[str, Any]]:
        if self.registry_file.exists():
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save(self):
        self.registry_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.registry_file, "w", encoding="utf-8") as f:
            json.dump(self.registry, f, indent=2)

    def register_document(
        self,
        doc_id: str,
        doc_hash: str,
        title: str,
        effective_date: str = "",
        source_url: str = ""
    ) -> Dict[str, Any]:
        """
        Register a document or update its version if hash/content changed.
        Marks older versions as superseded without deleting them.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        
        if doc_id in self.registry:
            existing = self.registry[doc_id]
            if existing.get("document_hash") == doc_hash:
                # Content identical, unchanged version
                return {
                    "doc_id": doc_id,
                    "version": existing.get("version", 1),
                    "status": "UNCHANGED",
                    "superseded": False
                }
            else:
                # Content changed, bump version and supersede previous
                new_version = existing.get("version", 1) + 1
                history = existing.get("version_history", [])
                history.append({
                    "version": existing.get("version", 1),
                    "document_hash": existing.get("document_hash"),
                    "replaced_at": now_iso
                })
                self.registry[doc_id] = {
                    "document_id": doc_id,
                    "title": title,
                    "document_hash": doc_hash,
                    "version": new_version,
                    "status": "SUPERSEDES_PREVIOUS",
                    "effective_date": effective_date or existing.get("effective_date", ""),
                    "source_url": source_url or existing.get("source_url", ""),
                    "last_updated": now_iso,
                    "version_history": history,
                    "is_active": True
                }
                self._save()
                return {
                    "doc_id": doc_id,
                    "version": new_version,
                    "status": "UPDATED",
                    "superseded": True
                }
        else:
            # New document entry
            self.registry[doc_id] = {
                "document_id": doc_id,
                "title": title,
                "document_hash": doc_hash,
                "version": 1,
                "status": "NEW",
                "effective_date": effective_date,
                "source_url": source_url,
                "created_at": now_iso,
                "last_updated": now_iso,
                "version_history": [],
                "is_active": True
            }
            self._save()
            return {
                "doc_id": doc_id,
                "version": 1,
                "status": "NEW",
                "superseded": False
            }

    def is_duplicate_hash(self, doc_hash: str) -> bool:
        """Check if exact SHA256 hash already exists in active documents."""
        for doc in self.registry.values():
            if doc.get("document_hash") == doc_hash and doc.get("is_active", True):
                return True
        return False
