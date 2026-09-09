"""
VentureRoot Freshness Policy & Lifecycle Engine
===============================================
Evaluates freshness of public, scraped, and government data.
Enforces strict lifecycle thresholds:
- Commodity Mandi Prices: CURRENT <= 3 days, AGING <= 7 days, else STALE
- Scraped Local Competitors: CURRENT <= 30 days, AGING <= 90 days, else STALE
- Business Directory / MSME Udyam: CURRENT <= 180 days, AGING <= 365 days, else STALE
- Census PCA Demographics: CURRENT <= 3650 days (Decennial census baseline)
"""

from datetime import datetime, timezone
from typing import Optional
from .authority import FreshnessStatus


FRESHNESS_THRESHOLDS_DAYS = {
    "COMMODITY_MANDI": {"current": 3, "aging": 7},
    "COMPETITOR_SCRAPED": {"current": 30, "aging": 90},
    "MSME_DIRECTORY": {"current": 180, "aging": 365},
    "CENSUS_DEMOGRAPHIC": {"current": 3650, "aging": 5475},  # Census decennial cycle
    "DEFAULT": {"current": 30, "aging": 90}
}


def assess_freshness(retrieved_at: Optional[str], data_type: str = "DEFAULT") -> FreshnessStatus:
    """
    Evaluates freshness status of a record based on retrieved_at ISO timestamp
    and data domain threshold.
    """
    if not retrieved_at:
        return FreshnessStatus.UNKNOWN

    try:
        # Parse ISO timestamp (handling 'Z' or local offsets)
        clean_ts = retrieved_at.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        age_days = (now - dt).total_seconds() / 86400.0
    except Exception:
        return FreshnessStatus.UNKNOWN

    thresholds = FRESHNESS_THRESHOLDS_DAYS.get(data_type.upper(), FRESHNESS_THRESHOLDS_DAYS["DEFAULT"])

    if age_days <= thresholds["current"]:
        return FreshnessStatus.CURRENT
    elif age_days <= thresholds["aging"]:
        return FreshnessStatus.AGING
    else:
        return FreshnessStatus.STALE
