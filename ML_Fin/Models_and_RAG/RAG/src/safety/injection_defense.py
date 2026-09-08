"""
Prompt Injection Defense Module.
Treats all retrieved text strictly as untrusted DATA and sanitizes instruction override patterns.
"""

import re
from typing import List
from ..chunking.structure_chunker import DocumentChunk

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"disregard\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"system\s*:\s*",
    r"you\s+are\s+now\s+a\s+",
    r"reveal\s+(api[_\s]*key|secret|password|credential)",
    r"execute\s+code",
    r"override\s+safety"
]

class InjectionDefense:
    def sanitize_text(self, text: str) -> str:
        """Sanitize text by neutralizing potential prompt injection instructions."""
        sanitized = text
        for pattern in INJECTION_PATTERNS:
            sanitized = re.sub(pattern, "[REDACTED_INSTRUCTION_OVERRIDE]", sanitized, flags=re.IGNORECASE)
        return sanitized

    def sanitize_chunks(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """Sanitize contents of retrieved chunks before passing to context."""
        cleaned_chunks = []
        for c in chunks:
            c_dict = c.model_dump()
            c_dict["content"] = self.sanitize_text(c_dict["content"])
            cleaned_chunks.append(DocumentChunk(**c_dict))
        return cleaned_chunks
