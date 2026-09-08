"""
GramBiz Model 2 -- Business Category Taxonomy & Mapping
==========================================================
Maps source-specific industry classifications (NIC / MSME / ASI)
to GramBiz 15 canonical business categories.
Saves mapping table to data/external/category_mapping.csv.
"""

import logging
import os
from typing import Dict, List

import pandas as pd

from src.config import CANONICAL_CATEGORIES, EXTERNAL_DATA_DIR

logger = logging.getLogger(__name__)

# Taxonomical Industry Keyword / NIC Crosswalk
CATEGORY_TAXONOMY_MAP: Dict[str, List[str]] = {
    "Dairy": ["dairy", "milk", "cattle", "bovine", "creameries", "ghee", "butter"],
    "Retail": ["retail", "kirana", "grocery", "general store", "provision", "store", "shop", "trade", "merchant"],
    "Textiles": ["textiles", "apparel", "garment", "weaving", "handloom", "tailoring", "cloth"],
    "Food Processing": ["food processing", "bakery", "grain mill", "flour mill", "oil mill", "spice", "agro processing"],
    "Agriculture": ["agriculture", "farming", "crop", "seeds", "fertilizer", "farm equipment", "pesticides"],
    "Fisheries": ["fisheries", "aquaculture", "fish farming", "hatchery", "prawn farming"],
    "Poultry": ["poultry", "hatchery", "broiler", "egg production", "chicken farming"],
    "Handicrafts": ["handicrafts", "pottery", "artisans", "woodwork", "embroidery", "crafts"],
    "Manufacturing": ["manufacturing", "fabrication", "assembly", "machinery", "engineering", "brick kiln"],
    "Services": ["services", "consulting", "financial", "education", "training", "it services"],
    "Repair/Maintenance": ["repair", "maintenance", "automobile repair", "mobile repair", "mechanic", "workshop"],
    "Transport": ["transport", "logistics", "freight", "cargo", "warehousing", "taxis"],
    "Hospitality": ["hospitality", "hotel", "restaurant", "eatery", "dhaba", "lodging"],
    "Personal Services": ["personal services", "beauty parlour", "salon", "laundry", "barber"],
    "Other": ["other", "miscellaneous", "general"]
}


def map_industry_to_canonical(industry_str: str) -> str:
    """Map raw industry string or NIC code to canonical GramBiz category."""
    if not isinstance(industry_str, str):
        return "Other"

    raw_lower = industry_str.lower().strip()
    for category, keywords in CATEGORY_TAXONOMY_MAP.items():
        for kw in keywords:
            if kw in raw_lower:
                return category
    return "Other"


def generate_category_mapping_csv() -> str:
    """Generate data/external/category_mapping.csv documentation."""
    os.makedirs(EXTERNAL_DATA_DIR, exist_ok=True)
    out_path = os.path.join(EXTERNAL_DATA_DIR, "category_mapping.csv")

    rows = []
    for cat, kws in CATEGORY_TAXONOMY_MAP.items():
        rows.append({
            "canonical_category": cat,
            "associated_keywords": ", ".join(kws),
            "description": f"Standardized business category for {cat}"
        })

    df = pd.DataFrame(rows)
    df.to_csv(out_path, index=False)
    logger.info(f"Generated category mapping at {out_path}")
    return out_path
