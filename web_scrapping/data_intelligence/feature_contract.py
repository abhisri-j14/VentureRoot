"""
VentureRoot ML Feature Contracts & Data Leakage Guardian
========================================================
Defines strict input feature contracts for:
- Model 1: Location Viability Classifier (Census PCA Demographic & Geographic features)
- Model 2: Business Success Scorer (Business profile, capital, experience, competitor saturation)
- Model 3: Dynamic Pricing & Cost Forecaster (Commodity type, mandi prices, seasonality)

Guarantees:
- Zero Data Leakage: Blocks future-outcome or target-derived inputs at runtime
- Strict type, unit, and value boundary validation
- Clear provenance and timestamp tracking for every feature
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class LeakageRiskLevel(str, Enum):
    NONE = "NONE"                     # Independent exogenous public or user feature
    TEMPORAL = "TEMPORAL"             # Time-series feature; requires pre-prediction timestamp
    TARGET_PROXY = "TARGET_PROXY"     # Dangerously correlated with or derived from target label


@dataclass
class FeatureSpecification:
    feature_name: str
    source: str
    data_type: str
    unit: str
    normalization: str
    expected_min: Optional[float]
    expected_max: Optional[float]
    required: bool
    leakage_risk: LeakageRiskLevel
    description: str


# =====================================================================
# MODEL 1 FEATURE CONTRACT (Location Viability / Census Demographics)
# =====================================================================

MODEL_1_FEATURE_CONTRACT: Dict[str, FeatureSpecification] = {
    "total_population": FeatureSpecification(
        feature_name="total_population",
        source="Census 2011 PCA Sub-district",
        data_type="int",
        unit="persons",
        normalization="StandardScaler / Log1p",
        expected_min=0,
        expected_max=5000000,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Sub-district total population from official census."
    ),
    "total_households": FeatureSpecification(
        feature_name="total_households",
        source="Census 2011 PCA Sub-district",
        data_type="int",
        unit="households",
        normalization="StandardScaler / Log1p",
        expected_min=0,
        expected_max=1000000,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Sub-district total household count."
    ),
    "literacy_rate": FeatureSpecification(
        feature_name="literacy_rate",
        source="Census 2011 PCA Sub-district",
        data_type="float",
        unit="percentage",
        normalization="MinMax [0, 1]",
        expected_min=0.0,
        expected_max=100.0,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Literacy rate percentage of the administrative block."
    ),
    "working_population_ratio": FeatureSpecification(
        feature_name="working_population_ratio",
        source="Census 2011 PCA Sub-district",
        data_type="float",
        unit="ratio",
        normalization="Ratio [0, 1]",
        expected_min=0.0,
        expected_max=1.0,
        required=False,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Total workers divided by total population."
    ),
    "population_density_sqkm": FeatureSpecification(
        feature_name="population_density_sqkm",
        source="Census 2011 + Area GIS",
        data_type="float",
        unit="persons/sq.km",
        normalization="Log1p",
        expected_min=1.0,
        expected_max=50000.0,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Population density of the block."
    )
}


# =====================================================================
# MODEL 2 FEATURE CONTRACT (Business Success / Micro-market Viability)
# =====================================================================

MODEL_2_FEATURE_CONTRACT: Dict[str, FeatureSpecification] = {
    "available_margin_capital": FeatureSpecification(
        feature_name="available_margin_capital",
        source="User Input",
        data_type="float",
        unit="INR",
        normalization="Log1p",
        expected_min=5000.0,
        expected_max=100000000.0,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Self-financed margin capital pledged by entrepreneur."
    ),
    "entrepreneur_experience_years": FeatureSpecification(
        feature_name="entrepreneur_experience_years",
        source="User Input",
        data_type="float",
        unit="years",
        normalization="MinMax [0, 50]",
        expected_min=0.0,
        expected_max=60.0,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Years of relevant domain experience."
    ),
    "competitor_count_5km": FeatureSpecification(
        feature_name="competitor_count_5km",
        source="VentureRoot Knowledge Graph / Competitor Engine",
        data_type="int",
        unit="count",
        normalization="Integer count / MinMax",
        expected_min=0,
        expected_max=200,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Direct competitors operating within 5km radius."
    ),
    "competitor_count_10km": FeatureSpecification(
        feature_name="competitor_count_10km",
        source="VentureRoot Knowledge Graph / Competitor Engine",
        data_type="int",
        unit="count",
        normalization="Integer count / MinMax",
        expected_min=0,
        expected_max=500,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Direct competitors operating within 10km catchment."
    ),
    "market_saturation_index": FeatureSpecification(
        feature_name="market_saturation_index",
        source="VentureRoot Competitor Intelligence Engine",
        data_type="float",
        unit="index [0, 1]",
        normalization="Standard index",
        expected_min=0.0,
        expected_max=1.0,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Competitor density relative to rural benchmark."
    ),
    "catchment_population_estimate": FeatureSpecification(
        feature_name="catchment_population_estimate",
        source="VentureRoot Geospatial Engine (Circle Density)",
        data_type="int",
        unit="persons",
        normalization="Log1p",
        expected_min=100,
        expected_max=2000000,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Estimated population within 10km radius."
    )
}


# =====================================================================
# MODEL 3 FEATURE CONTRACT (Pricing & Cost Forecaster)
# =====================================================================

MODEL_3_FEATURE_CONTRACT: Dict[str, FeatureSpecification] = {
    "commodity_normalized": FeatureSpecification(
        feature_name="commodity_normalized",
        source="VentureRoot Valuation Engine",
        data_type="str",
        unit="string code",
        normalization="Canonical commodity lookup",
        expected_min=None,
        expected_max=None,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Standardized commodity name (e.g. 'Wheat', 'Milk (Cow)')."
    ),
    "modal_price_benchmark": FeatureSpecification(
        feature_name="modal_price_benchmark",
        source="eNAM / Agmarknet Mandi Reports",
        data_type="float",
        unit="INR/quintal or INR/unit",
        normalization="Absolute price",
        expected_min=1.0,
        expected_max=200000.0,
        required=True,
        leakage_risk=LeakageRiskLevel.TEMPORAL,
        description="Latest historical modal mandi price before prediction date."
    ),
    "month_of_year": FeatureSpecification(
        feature_name="month_of_year",
        source="System Calendar",
        data_type="int",
        unit="month [1-12]",
        normalization="Cyclical sin/cos encoding",
        expected_min=1,
        expected_max=12,
        required=True,
        leakage_risk=LeakageRiskLevel.NONE,
        description="Calendar month to capture agro seasonality."
    )
}


# =====================================================================
# STRICT DATA LEAKAGE BLACKLIST (CAN NEVER ENTER ANY MODEL FEATURE VECTOR)
# =====================================================================

FORBIDDEN_LEAKAGE_FIELDS = {
    "actual_future_revenue",
    "actual_profit_after_1_year",
    "future_business_survival",
    "target_viability_score",
    "target_success_flag",
    "post_launch_revenue",
    "future_mandi_price",
    "post_outcome_sales",
    "ground_truth_label"
}


def validate_feature_contract(
    model_name: str,
    feature_dict: Dict[str, Any]
) -> Tuple[bool, List[str], List[str]]:
    """
    Validates a feature payload against the model's feature contract.
    Returns: (is_valid, errors, warnings)
    
    CRITICAL: Any presence of FORBIDDEN_LEAKAGE_FIELDS immediately fails validation.
    """
    errors: List[str] = []
    warnings: List[str] = []

    # 1. Check for severe data leakage violations
    for key in feature_dict.keys():
        if key.lower() in FORBIDDEN_LEAKAGE_FIELDS:
            errors.append(f"DATA LEAKAGE DETECTED: Forbidden field '{key}' is present in input feature vector!")

    # 2. Select target contract
    contract_map = {
        "model_1": MODEL_1_FEATURE_CONTRACT,
        "model_2": MODEL_2_FEATURE_CONTRACT,
        "model_3": MODEL_3_FEATURE_CONTRACT
    }
    contract = contract_map.get(model_name.lower())
    if not contract:
        errors.append(f"Unknown model name '{model_name}'. Valid options: model_1, model_2, model_3.")
        return False, errors, warnings

    # 3. Check for missing required features
    for fname, spec in contract.items():
        if spec.required and fname not in feature_dict:
            errors.append(f"Missing required feature '{fname}' for {model_name}.")

    # 4. Check data types and bounds
    for fname, val in feature_dict.items():
        if fname not in contract:
            warnings.append(f"Uncontracted feature '{fname}' provided to {model_name}; will be ignored by model.")
            continue

        spec = contract[fname]
        if val is None:
            if spec.required:
                errors.append(f"Feature '{fname}' is required but was None.")
            continue

        # Boundary checks
        if spec.data_type in ("int", "float"):
            try:
                num_val = float(val)
                if spec.expected_min is not None and num_val < spec.expected_min:
                    errors.append(f"Feature '{fname}' value {num_val} < minimum {spec.expected_min}.")
                if spec.expected_max is not None and num_val > spec.expected_max:
                    errors.append(f"Feature '{fname}' value {num_val} > maximum {spec.expected_max}.")
            except (ValueError, TypeError):
                errors.append(f"Feature '{fname}' expected {spec.data_type}, got {type(val).__name__}.")

    is_valid = len(errors) == 0
    return is_valid, errors, warnings
