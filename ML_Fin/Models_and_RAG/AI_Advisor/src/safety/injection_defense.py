"""
AI Advisor Prompt Injection Defense Module.
Treats all user inputs and retrieved RAG context strictly as DATA.
"""

import re
from typing import List

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"disregard\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"system\s*:\s*",
    r"you\s+are\s+now\s+a\s+",
    r"reveal\s+(api[_\s]*key|secret|password|credential)",
    r"execute\s+code",
    r"override\s+safety"
]

class AdvisorInjectionDefense:
    def sanitize_input(self, text: str) -> str:
        """Sanitize text by neutralizing potential prompt injection instructions."""
        sanitized = text
        for pattern in INJECTION_PATTERNS:
            sanitized = re.sub(pattern, "[REDACTED_INSTRUCTION_OVERRIDE]", sanitized, flags=re.IGNORECASE)
        return sanitized
