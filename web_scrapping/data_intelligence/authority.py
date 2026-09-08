"""
VentureRoot Source Authority Hierarchy & Data Provenance Module
=============================================================
Enforces strict 4-level data source authority hierarchy, audit trails, and provenance tracking.
Every external or synthesized data record MUST carry full provenance metadata.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class AuthorityLevel(str, Enum):
    """
    Hierarchical ranking of external and public data sources.
    Lower rank values indicate higher institutional authority and legal standing.
    """
    LEVEL_1_CENTRAL_GOVERNMENT = "LEVEL_1_CENTRAL_GOVERNMENT"  # Census of India, MoSPI, ORGI, Ministry of MSME, Agmarknet, OGD India
    LEVEL_2_STATE_GOVERNMENT = "LEVEL_2_STATE_GOVERNMENT"      # State APMC boards, State Agriculture Dept, District Gazettes
    LEVEL_3_PUBLIC_INSTITUTIONS = "LEVEL_3_PUBLIC_INSTITUTIONS" # NABARD, RBI, ICAR, State Agricultural Universities, Trade Councils
    LEVEL_4_OTHER_PUBLIC_SOURCES = "LEVEL_4_OTHER_PUBLIC_SOURCES" # OpenStreetMap, verified business registries, public web directories

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, int):
            int_map = {
                1: cls.LEVEL_1_CENTRAL_GOVERNMENT,
                2: cls.LEVEL_2_STATE_GOVERNMENT,
                3: cls.LEVEL_3_PUBLIC_INSTITUTIONS,
                4: cls.LEVEL_4_OTHER_PUBLIC_SOURCES,
            }
            if value in int_map:
                return int_map[value]
        if isinstance(value, str):
            clean = value.strip().upper()
            if clean in cls._member_map_:
                return cls._member_map_[clean]
            if "PUBLIC_INSTITUTION" in clean:
                return cls.LEVEL_3_PUBLIC_INSTITUTIONS
            if "PUBLIC_SOURCE" in clean:
                return cls.LEVEL_4_OTHER_PUBLIC_SOURCES
            for m in cls:
                if m.name == clean:
                    return m
        return super()._missing_(value)

    @property
    def rank(self) -> int:
        ranks = {
            self.LEVEL_1_CENTRAL_GOVERNMENT: 1,
            self.LEVEL_2_STATE_GOVERNMENT: 2,
            self.LEVEL_3_PUBLIC_INSTITUTIONS: 3,
            self.LEVEL_4_OTHER_PUBLIC_SOURCES: 4,
        }
        return ranks.get(self, 4)


# Aliases for backward compatibility
AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTION = AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS  # type: ignore
AuthorityLevel.LEVEL_4_PUBLIC_SOURCES = AuthorityLevel.LEVEL_4_OTHER_PUBLIC_SOURCES  # type: ignore


class ConfidenceStatus(str, Enum):
    """Integrity and reliability status of a data record."""
    VERIFIED = "VERIFIED"          # Direct official government record with confirmed provenance
    PROVISIONAL = "PROVISIONAL"    # Official survey/bulletin subject to subsequent periodic revision
    ESTIMATED = "ESTIMATED"        # Scientifically derived spatial or density proxy (explicitly non-census)
    UNVERIFIED = "UNVERIFIED"      # Web-scraped listing requiring field survey corroboration


class FreshnessStatus(str, Enum):
    """Temporal currency of an external or scraped dataset."""
    CURRENT = "CURRENT"            # Within acceptable operational freshness threshold (< 30-90 days or current decennial cycle)
    AGING = "AGING"                # Older than ideal threshold, but within usable bounds (90-180 days)
    STALE = "STALE"                # Exceeded freshness threshold (> 180 days for prices, or outdated benchmark)
    UNKNOWN = "UNKNOWN"            # Source does not provide timestamp metadata


class DataProvenance(BaseModel):
    """
    Mandatory metadata attached to every data entity in VentureRoot.
    Guarantees transparency, traceability, and prevents deceptive fabrication of data.
    """
    source_name: str = Field(..., description="Canonical name of the data provider or publisher")
    source_type: str = Field(..., description="Classification: OFFICIAL_PORTAL, CENSUS_PCA, APMC_BULLETIN, PUBLIC_REGISTRY, etc.")
    source_url: Optional[str] = Field(None, description="Direct URL to original dataset or portal endpoint")
    authority_level: AuthorityLevel = Field(..., description="Level 1 to 4 authority ranking")
    retrieved_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of data retrieval"
    )
    data_version: Optional[str] = Field("1.0.0", description="Version or year anchor of original dataset")
    confidence_status: ConfidenceStatus = Field(ConfidenceStatus.VERIFIED, description="VERIFIED, PROVISIONAL, ESTIMATED, UNVERIFIED")
    freshness_status: FreshnessStatus = Field(FreshnessStatus.CURRENT, description="CURRENT, AGING, STALE, UNKNOWN")
    collection_method: str = Field("API_OR_BULLETIN", description="SCRAPED_HTTP, REST_API, BULK_DOWNLOAD, SPATIAL_INTERPOLATION")
    notes: Optional[str] = Field(None, description="Optional methodological caveats or provenance clarifications")

    def is_official(self) -> bool:
        """Returns True if the data source is Level 1 or Level 2 official government authority."""
        return self.authority_level in (AuthorityLevel.LEVEL_1_CENTRAL_GOVERNMENT, AuthorityLevel.LEVEL_2_STATE_GOVERNMENT)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_name": self.source_name,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "authority_level": self.authority_level.value,
            "retrieved_at": self.retrieved_at,
            "data_version": self.data_version,
            "confidence_status": self.confidence_status.value,
            "freshness_status": self.freshness_status.value,
            "collection_method": self.collection_method,
            "notes": self.notes
        }
