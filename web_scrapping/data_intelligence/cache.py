"""
VentureRoot Provenance-Aware Cache Manager
==========================================
Provides in-memory caching with TTL expiration, hit/miss telemetry,
and source attribution tracking to prevent redundant web scraping.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple


class CacheEntry:
    def __init__(
        self,
        key: str,
        value: Any,
        ttl_seconds: int,
        source: str = "CACHE",
        data_type: str = "GENERIC"
    ):
        self.key = key
        self.value = value
        self.ttl_seconds = ttl_seconds
        self.created_at_epoch = time.time()
        self.created_at_iso = datetime.now(timezone.utc).isoformat()
        self.source = source
        self.data_type = data_type

    def is_expired(self) -> bool:
        if self.ttl_seconds <= 0:
            return False  # Never expires
        return (time.time() - self.created_at_epoch) > self.ttl_seconds


class CacheManager:
    """
    Thread-safe in-memory cache supporting TTL, provenance preservation,
    and performance telemetry.
    """
    def __init__(self):
        self._store: Dict[str, CacheEntry] = {}
        self.hits: int = 0
        self.misses: int = 0

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            self.misses += 1
            return None

        if entry.is_expired():
            del self._store[key]
            self.misses += 1
            return None

        self.hits += 1
        return entry.value

    def get_with_metadata(self, key: str) -> Tuple[Optional[Any], Optional[Dict[str, Any]]]:
        entry = self._store.get(key)
        if entry is None or entry.is_expired():
            self.misses += 1
            return None, None

        self.hits += 1
        meta = {
            "cached_at": entry.created_at_iso,
            "ttl_remaining_seconds": max(0, int(entry.ttl_seconds - (time.time() - entry.created_at_epoch))),
            "source": entry.source,
            "data_type": entry.data_type
        }
        return entry.value, meta

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: int = 86400,  # 24 hours default
        source: str = "UNKNOWN",
        data_type: str = "GENERIC"
    ) -> None:
        self._store[key] = CacheEntry(
            key=key,
            value=value,
            ttl_seconds=ttl_seconds,
            source=source,
            data_type=data_type
        )

    def invalidate(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    def clear(self) -> None:
        self._store.clear()
        self.hits = 0
        self.misses = 0

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_ratio = (self.hits / total) if total > 0 else 0.0
        return {
            "total_entries": len(self._store),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": round(hit_ratio, 3)
        }


# Global default cache singleton
default_cache = CacheManager()
