"""
GramBiz Model 3 — Logger Utility
=================================
Provides structured logger that sanitizes API keys and sensitive credentials.
"""

import logging
import sys
import re

API_KEY_REGEX = re.compile(r"(api[_-]?key|token|secret)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-]+)['\"]?", re.IGNORECASE)


class SensitiveFilter(logging.Filter):
    """Filters out any accidental API keys from logs."""
    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = API_KEY_REGEX.sub(r"\1: [REDACTED]", record.msg)
        return True


def get_logger(name: str = "GramBizModel3") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveFilter())
        logger.addHandler(handler)
    return logger
