"""
GramBiz Model 1 -- Category-Specific Features
================================================
Load and apply category-specific MPI component weights.

Weight source: domain-informed defaults stored in configs/category_weights.yaml.
These weights are NOT empirically validated from business outcome data.
"""

import os
import logging
from typing import Dict, List, Optional

import yaml

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def load_category_weights() -> dict:
    """Load category weights from YAML configuration."""
    path = os.path.join(BASE_DIR, "configs", "category_weights.yaml")
    with open(path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config


def get_supported_categories() -> List[str]:
    """Return list of supported business categories."""
    config = load_category_weights()
    return list(config.get("categories", {}).keys()) + ["other"]


def get_category_weights(category: str) -> Dict[str, float]:
    """
    Get MPI component weights for a specific business category.

    Parameters
    ----------
    category : str
        Business category name (e.g., 'dairy', 'retail').

    Returns
    -------
    dict
        MPI component weights that sum to 1.0.
    """
    config = load_category_weights()
    cat_key = category.lower().replace(" ", "_").replace("-", "_")

    categories = config.get("categories", {})
    default_weights = config.get("default", {})

    if cat_key in categories:
        weights = {
            "demand_proxy": categories[cat_key].get("demand_proxy", default_weights["demand_proxy"]),
            "purchasing_power_proxy": categories[cat_key].get("purchasing_power_proxy", default_weights["purchasing_power_proxy"]),
            "workforce_opportunity": categories[cat_key].get("workforce_opportunity", default_weights["workforce_opportunity"]),
            "infrastructure_development": categories[cat_key].get("infrastructure_development", default_weights["infrastructure_development"]),
            "market_gap_proxy": categories[cat_key].get("market_gap_proxy", default_weights["market_gap_proxy"]),
        }
    else:
        logger.warning(f"Category '{category}' not found. Using default weights.")
        weights = dict(default_weights)

    # Validate weights sum to 1.0
    total = sum(weights.values())
    if abs(total - 1.0) > 0.01:
        logger.warning(f"Category weights sum to {total}, normalizing to 1.0")
        weights = {k: v / total for k, v in weights.items()}

    return weights


def get_category_relevant_workforce_columns(category: str) -> List[str]:
    """
    Get workforce columns most relevant to a business category.

    Parameters
    ----------
    category : str
        Business category name.

    Returns
    -------
    list of str
        Relevant workforce feature column names.
    """
    config = load_category_weights()
    cat_key = category.lower().replace(" ", "_").replace("-", "_")
    categories = config.get("categories", {})

    if cat_key in categories:
        return categories[cat_key].get("workforce_relevance_columns", [])
    return []


def get_weight_type() -> str:
    """Return the type of weights being used."""
    config = load_category_weights()
    return config.get("weight_type", "domain_informed")
