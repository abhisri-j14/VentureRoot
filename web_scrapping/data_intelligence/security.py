"""
VentureRoot Data Security & Prompt Injection Defense Engine
===========================================================
Enforces:
- Strict sanitization of external scraped content (HTML stripping, character cleansing)
- Prompt injection quarantine: Wraps scraped text into inert JSON data payloads
  preventing LLM / AI Advisor instruction hijacking
- Secrets masking in logs (redacts API keys, tokens, sensitive credentials)
- Validation against shell, SQL, or script injection in user input fields
"""

from __future__ import annotations

import html
import re
from typing import Any, Dict, List, Optional


# Regex patterns commonly used in prompt injection attempts
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"you\s+are\s+now\s+(a|an|the)?\s*(\w+)",
    r"system\s*:\s*",
    r"system\s+override",
    r"disregard\s+(the\s+)?guidelines?",
    r"as\s+an\s+unrestricted\s+ai",
    r"developer\s+mode\s+activated",
    r"<\s*script[^>]*>.*<\s*/\s*script\s*>",
    r"javascript\s*:\s*",
]

# Sensitive token / credential patterns for log redaction
SECRET_REDACTION_PATTERNS = [
    r"(?i)(api[_-]?key|secret|token|password|auth|bearer)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-\.]{8,})['\"]?",
    r"(?i)(AIzaSy[a-zA-Z0-9_\-]{33})",  # Google API key pattern
]


def sanitize_untrusted_text(text: Optional[str], max_length: int = 500) -> str:
    """
    Sanitizes external scraped text:
    1. Unescapes and strips HTML entities/tags.
    2. Strips control characters and non-printable bytes.
    3. Normalizes repeated whitespace.
    4. Truncates to max_length.
    """
    if not text:
        return ""

    # HTML unescape and strip tags
    clean = html.unescape(text)
    clean = re.sub(r"<[^>]+>", " ", clean)

    # Remove non-printable / control characters (except normal space, newline)
    clean = re.sub(r"[^\x20-\x7E\u0900-\u097F\n\r\t]", " ", clean)

    # Normalize whitespace
    clean = re.sub(r"\s+", " ", clean).strip()

    return clean[:max_length]


def scan_for_prompt_injection(content: str) -> Tuple[bool, List[str]]:
    """
    Scans scraped or user text for prompt injection vectors.
    Returns (has_suspicious_patterns, detected_patterns).
    """
    detected = []
    lower_content = content.lower()

    for pattern in PROMPT_INJECTION_PATTERNS:
        match = re.search(pattern, lower_content, re.IGNORECASE)
        if match:
            detected.append(match.group(0))

    return (len(detected) > 0, detected)


def quarantine_as_inert_data(content: str, source_label: str = "EXTERNAL_UNTRUSTED_DATA") -> Dict[str, Any]:
    """
    Safely envelopes external text into an inert, tagged dictionary payload
    so that downstream LLMs / AI Advisor will treat it strictly as passive data,
    never as active instructions.
    """
    sanitized = sanitize_untrusted_text(content)
    is_suspicious, patterns = scan_for_prompt_injection(sanitized)

    return {
        "_content_role": "INERT_DATA_FIELD",
        "_source_origin": source_label,
        "_is_sanitized": True,
        "_quarantined_prompt_injection": is_suspicious,
        "_detected_injection_tokens": patterns if is_suspicious else [],
        "safe_content": sanitized
    }


def redact_secrets_for_logging(log_message: str) -> str:
    """
    Replaces sensitive credentials, API keys, and passwords with '[REDACTED]'.
    """
    redacted = log_message
    for pattern in SECRET_REDACTION_PATTERNS:
        redacted = re.sub(pattern, r"\1: [REDACTED]", redacted)
    return redacted
