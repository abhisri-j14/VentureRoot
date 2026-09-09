"""
Document Hash & Deduplication Integrity Module.
Computes SHA256 checksums of documents and content strings.
"""

import hashlib
from pathlib import Path
from typing import Union

def compute_file_sha256(file_path: Union[str, Path]) -> str:
    """Compute SHA256 hash of a file on disk."""
    hasher = hashlib.sha256()
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def compute_text_sha256(text: str) -> str:
    """Compute SHA256 hash of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
