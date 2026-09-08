"""
RAG Source Authority Governance Policy.
Classifies sources into 4 hierarchical authority levels.
"""

from enum import IntEnum
from typing import Dict, Any

class SourceAuthorityLevel(IntEnum):
    LEVEL_1_CENTRAL_GOVT = 1  # Official Govt of India, Ministries, Direct Govt Portals, Gazettes
    LEVEL_2_STATE_GOVT = 2    # State Govt websites, State Departments, District APMC portals
    LEVEL_3_PUBLIC_INSTITUTION = 3 # NABARD, RBI, NITI Aayog, ICAR, Recognized Public Financial/Agri Institutes
    LEVEL_4_OTHER = 4         # Industry Reports, Verified News, Generic Knowledge Bases

AUTHORITY_WEIGHTS: Dict[SourceAuthorityLevel, float] = {
    SourceAuthorityLevel.LEVEL_1_CENTRAL_GOVT: 1.0,
    SourceAuthorityLevel.LEVEL_2_STATE_GOVT: 0.9,
    SourceAuthorityLevel.LEVEL_3_PUBLIC_INSTITUTION: 0.8,
    SourceAuthorityLevel.LEVEL_4_OTHER: 0.6,
}

AUTHORITY_KEYWORDS = {
    SourceAuthorityLevel.LEVEL_1_CENTRAL_GOVT: [
        "gov.in", "nic.in", "india.gov.in", "msme.gov.in", "mofpi.gov.in",
        "ministry", "central government", "gazette of india", "pib.gov.in", "pmegp"
    ],
    SourceAuthorityLevel.LEVEL_2_STATE_GOVT: [
        "wb.gov.in", "state government", "department of agriculture", "apmc",
        "district magistrate", "state portal", "wbic", "banglarmukh"
    ],
    SourceAuthorityLevel.LEVEL_3_PUBLIC_INSTITUTION: [
        "rbi.org.in", "nabard.org", "niti.gov.in", "icar.org.in", "kvic",
        "public sector bank", "sidbi.in"
    ]
}

def classify_source_authority(source_name: str, source_url: str = "") -> SourceAuthorityLevel:
    """Determine source authority level based on name and URL indicators."""
    combined = (source_name + " " + source_url).lower()
    
    # State domain indicators take precedence over generic gov.in
    state_indicators = ["wb.gov.in", "state government", "department of agriculture", "apmc", "district magistrate", "west bengal", "banglarmukh"]
    if any(kw in combined for kw in state_indicators):
        return SourceAuthorityLevel.LEVEL_2_STATE_GOVT

    for level, keywords in AUTHORITY_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return level
            
    return SourceAuthorityLevel.LEVEL_4_OTHER

def get_authority_weight(level: SourceAuthorityLevel) -> float:
    """Return numeric ranking multiplier for source authority level."""
    return AUTHORITY_WEIGHTS.get(level, 0.6)
