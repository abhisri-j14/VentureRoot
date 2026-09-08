"""
Document Freshness Classifier.
Determines currency status (CURRENT, AGING, STALE, UNKNOWN) from document metadata.
"""

from enum import Enum
from datetime import datetime, timezone

class FreshnessStatus(str, Enum):
    CURRENT = "CURRENT"
    AGING = "AGING"
    STALE = "STALE"
    UNKNOWN = "UNKNOWN"

def classify_freshness(date_str: str) -> FreshnessStatus:
    """Classify document freshness based on ISO date string YYYY-MM-DD or YYYY."""
    if not date_str or date_str.strip() == "":
        return FreshnessStatus.UNKNOWN

    try:
        # Parse year or full date
        clean_date = date_str.strip()[:10]
        if len(clean_date) == 4 and clean_date.isdigit():
            doc_year = int(clean_date)
        else:
            dt = datetime.strptime(clean_date, "%Y-%m-%d")
            doc_year = dt.year

        current_year = datetime.now(timezone.utc).year
        age_years = current_year - doc_year

        if age_years <= 2:
            return FreshnessStatus.CURRENT
        elif age_years <= 5:
            return FreshnessStatus.AGING
        else:
            return FreshnessStatus.STALE
    except Exception:
        return FreshnessStatus.UNKNOWN
