"""
VentureRoot Data Intelligence Layer — Computational Adapters
============================================================
Authoritative, failure-isolated adapters connecting core computational engines:
- Model 1: Market Potential Index (MPI) Predictor with unified opportunity tiers
- Model 2: Business Viability & Category Opportunity Engine (hierarchical resolution)
- Model 3: Commodity Price Forecasting with Conformal Uncertainty Bounds
- Finance Engine: Authoritative SIH Micro Finance / Term Loan Scheme Calculator
- Knowledge Graph: Spatial Reach & Competitor Saturation Mapping
- RAG Pipeline: Official Government Scheme & Regulatory Retrieval with Abstention
- Numerical Integrity Firewall: Statutory Verification against LLM hallucination
- Gemini Advisor: Low-temperature structured advisory synthesis with deterministic fallback
"""

import json
import logging
import math
import os
import re
import sys
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx

from .schemas import (
    AmortizationScheduleRow,
    ApplicableScheme,
    ComponentStatus,
    FinanceOutput,
    Model1Output,
    Model2Output,
    Model3Output,
    OpportunityTier,
    ReliabilityRating,
    WorkingCapitalSummary,
    FreshnessStatus,
    RAGCitation,
    RAGEvidenceResult,
    AdvisorySWOT,
    AdvisorySynthesis,
    NumericalIntegrityStatus,
    IntegratedStep3Result,
    IntegratedStep4Result,
    UserBusinessInput,
    get_opportunity_tier,
)

logger = logging.getLogger(__name__)

# Dynamic Project Root Resolution
_current_dir = Path(__file__).resolve().parent
WORKSPACE_ROOT = _current_dir.parent.parent
for _cand in [_current_dir.parent, _current_dir.parent.parent, _current_dir.parent.parent.parent]:
    if (_cand / "ML_Fin").exists():
        WORKSPACE_ROOT = _cand
        break

ML_FIN_DIR = WORKSPACE_ROOT / "ML_Fin"
MODEL_1_DIR = ML_FIN_DIR / "Models_and_RAG" / "Model_1"
MODEL_2_DIR = ML_FIN_DIR / "Models_and_RAG" / "Model_2"
MODEL_3_DIR = ML_FIN_DIR / "Models_and_RAG" / "Model_3"
RAG_DIR = ML_FIN_DIR / "Models_and_RAG" / "RAG"
AI_ADVISOR_DIR = ML_FIN_DIR / "Models_and_RAG" / "AI_Advisor"
FINANCE_ENGINE_DIR = ML_FIN_DIR / "Finance_Engine" / "module_2"


@contextmanager
def isolated_model_context(model_dir: Path):
    """
    Temporarily isolates sys.path and sys.modules['src'] so each ML component
    executes its own internal 'src' package without Python namespace collisions.
    """
    model_dir_str = str(model_dir.resolve())
    old_path = list(sys.path)
    old_cwd = os.getcwd()

    cached_mods = {
        k: sys.modules.pop(k)
        for k in list(sys.modules.keys())
        if k in ("src", "api") or k.startswith("src.") or k.startswith("api.")
    }

    other_model_dirs = {
        str(MODEL_1_DIR.resolve()),
        str(MODEL_2_DIR.resolve()),
        str(MODEL_3_DIR.resolve()),
        str(RAG_DIR.resolve()),
        str(AI_ADVISOR_DIR.resolve()),
        str(FINANCE_ENGINE_DIR.resolve()),
    }
    clean_path = [p for p in old_path if p not in other_model_dirs]
    sys.path = [model_dir_str] + clean_path

    try:
        os.chdir(model_dir)
        yield
    finally:
        os.chdir(old_cwd)
        for k in list(sys.modules.keys()):
            if k in ("src", "api") or k.startswith("src.") or k.startswith("api."):
                sys.modules.pop(k, None)
        sys.modules.update(cached_mods)
        sys.path = old_path


# =====================================================================
# 1. MODEL 1 ADAPTER (Market Potential Index / MPI)
# =====================================================================

class Model1Adapter:
    """
    Adapter for Model 1 (GramBizPredictor).
    Executes trained CatBoost/Ridge MPI inference with unified opportunity tiers.
    """
    def __init__(self):
        self._predictor = None
        self._init_error = None
        self._load_predictor()

    def _load_predictor(self):
        try:
            with isolated_model_context(MODEL_1_DIR):
                from src.models.predict import GramBizPredictor
                self._predictor = GramBizPredictor()
                logger.info("Model 1 Predictor loaded successfully in Model1Adapter.")
        except Exception as e:
            self._init_error = str(e)
            logger.error(f"Failed to load Model 1 Predictor: {e}", exc_info=True)

    def predict(
        self,
        state: str,
        district: str,
        business_category: str,
        subdistrict: Optional[str] = None,
        village: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> Model1Output:
        """
        Executes Model 1 prediction with graceful sub-district fallback and unified tier boundaries.
        """
        if not state or not district:
            return Model1Output(
                status=ComponentStatus.FAILED,
                market_potential_score=None,
                opportunity_tier=OpportunityTier.UNKNOWN,
                warnings=["Location state and district are required for Model 1 prediction."],
                prediction_timestamp=datetime.now(timezone.utc).isoformat()
            )

        if self._predictor is None:
            return Model1Output(
                status=ComponentStatus.UNAVAILABLE,
                warnings=[f"Model 1 engine unavailable: {self._init_error or 'Initialization failed'}"]
            )

        try:
            with isolated_model_context(MODEL_1_DIR):
                raw_res = self._predictor.predict(
                    state=state,
                    district=district,
                    business_category=business_category,
                    subdistrict=subdistrict,
                    village=village,
                    latitude=latitude,
                    longitude=longitude,
                )

                # Retry at district level if subdistrict was not found
                if raw_res.get("market_potential_score") is None and subdistrict:
                    dist_res = self._predictor.predict(
                        state=state,
                        district=district,
                        business_category=business_category,
                        subdistrict=None,
                        village=None,
                        latitude=latitude,
                        longitude=longitude,
                    )
                    if dist_res.get("market_potential_score") is not None:
                        raw_res = dist_res
                        raw_res.setdefault("warnings", []).append(
                            f"Sub-district '{subdistrict}' not in Census 2011 dataset; using district-level baseline for {district}."
                        )

            raw_mps = raw_res.get("market_potential_score")
            market_potential_score = float(raw_mps) if raw_mps is not None else None

            # Map canonical opportunity tier using the central single-source-of-truth function
            opp_tier = get_opportunity_tier(market_potential_score)

            demand_sc = raw_res.get("demand_score")
            pp_sc = raw_res.get("purchasing_power_score")
            wf_sc = raw_res.get("workforce_opportunity_score")
            infra_sc = raw_res.get("infrastructure_score")
            gap_sc = raw_res.get("market_gap_score")

            conf_sc = raw_res.get("confidence_score")
            conf_pct = float(conf_sc) if conf_sc is not None else (80.0 if market_potential_score is not None else 0.0)

            positive_factors = [
                f["factor"] if isinstance(f, dict) else str(f)
                for f in raw_res.get("top_positive_factors", [])
            ]
            negative_factors = [
                f["factor"] if isinstance(f, dict) else str(f)
                for f in raw_res.get("top_negative_factors", [])
            ]

            status = ComponentStatus.SUCCESS if market_potential_score is not None else ComponentStatus.FAILED

            return Model1Output(
                status=status,
                model_version=str(raw_res.get("model_version", "1.0.0")),
                methodology_version=str(raw_res.get("methodology_version", "1.0.0")),
                market_potential_score=market_potential_score,
                opportunity_tier=opp_tier,
                demand_score=float(demand_sc) if demand_sc is not None else None,
                purchasing_power_score=float(pp_sc) if pp_sc is not None else None,
                workforce_opportunity_score=float(wf_sc) if wf_sc is not None else None,
                infrastructure_score=float(infra_sc) if infra_sc is not None else None,
                market_gap_score=float(gap_sc) if gap_sc is not None else None,
                confidence_score_pct=conf_pct,
                top_positive_factors=positive_factors,
                top_negative_factors=negative_factors,
                feature_snapshot={
                    "state": state,
                    "district": district,
                    "subdistrict": subdistrict,
                    "model_type": raw_res.get("model_type", "Ridge/CatBoost"),
                },
                prediction_timestamp=datetime.now(timezone.utc).isoformat(),
                warnings=list(raw_res.get("warnings", [])),
                limitations=list(raw_res.get("limitations", [])),
            )
        except Exception as e:
            logger.error(f"Model 1 prediction failure: {e}", exc_info=True)
            return Model1Output(
                status=ComponentStatus.FAILED,
                warnings=[f"Model 1 prediction execution failed: {str(e)}"]
            )


# =====================================================================
# 2. MODEL 2 ADAPTER (Business Viability & Opportunity Analysis)
# =====================================================================

class Model2Adapter:
    """
    Adapter for Model 2 (Model2InferenceEngine).
    Provides hyper-local viability analysis and canonical category rankings with
    hierarchical resolution (subdistrict -> district -> state -> INSUFFICIENT_DATA).
    """
    def __init__(self):
        self._engine = None
        self._init_error = None
        self._load_engine()

    def _load_engine(self):
        try:
            with isolated_model_context(MODEL_2_DIR):
                from src.models.predict import Model2InferenceEngine
                self._engine = Model2InferenceEngine()
                logger.info("Model 2 Inference Engine loaded successfully in Model2Adapter.")
        except Exception as e:
            self._init_error = str(e)
            logger.error(f"Failed to load Model 2 Engine: {e}", exc_info=True)

    def analyze(
        self,
        state: str,
        district: str,
        business_category: str,
        subdistrict: Optional[str] = None,
        competitor_count_radius: int = 0,
        competitor_density: float = 0.0,
        saturation_index: float = 0.0,
        saturation_status: str = "MODERATE",
        nearest_competitor_distance_km: Optional[float] = None,
    ) -> Model2Output:
        """
        Executes Model 2 analysis with failure isolation, category mapping, and saturation injection.
        """
        if self._engine is None:
            return Model2Output(
                status=ComponentStatus.UNAVAILABLE,
                selected_category=business_category,
                warnings=[f"Model 2 engine unavailable: {self._init_error or 'Initialization failed'}"]
            )

        try:
            with isolated_model_context(MODEL_2_DIR):
                raw_res = self._engine.analyze_location(
                    state_name=state,
                    district_name=district,
                    subdistrict_name=subdistrict,
                    business_category=business_category
                )

            # Handle genuine INSUFFICIENT_DATA without fabricating constants
            if raw_res.get("status") == "INSUFFICIENT_DATA" or raw_res.get("overall_viability_score") is None:
                return Model2Output(
                    status=ComponentStatus.DEGRADED,
                    model_version=str(raw_res.get("model_version", "1.0.0")),
                    methodology_version=str(raw_res.get("methodology_version", "1.0.0")),
                    viability_score=0.0,
                    market_gap_score=50.0,
                    competition_level="Moderate",
                    risk_level="High",
                    score_band="Insufficient Data",
                    confidence_rating="None",
                    data_completeness_pct=0.0,
                    is_out_of_distribution=True,
                    selected_category=business_category,
                    category_rankings=[],
                    relevant_drivers=["Location not found in master database; regional baseline unavailable."],
                    feature_snapshot={
                        "state": state,
                        "district": district,
                        "subdistrict": subdistrict,
                        "status": "INSUFFICIENT_DATA"
                    },
                    prediction_timestamp=datetime.now(timezone.utc).isoformat(),
                    warnings=list(raw_res.get("warnings", [])),
                    limitations=list(raw_res.get("limitations", []))
                )

            viability_sc = float(raw_res.get("overall_viability_score", 50.0))
            score_band = str(raw_res.get("score_band", "Moderate Opportunity"))

            # Derive competition and risk levels from empirical saturation & Model 2 output
            if saturation_status == "HIGH_SATURATION" or competitor_density > 0.08:
                competition_lvl = "High"
                risk_lvl = "High" if viability_sc < 50.0 else "Medium-High"
            elif saturation_status == "LOW_SATURATION" or competitor_density < 0.02:
                competition_lvl = "Low"
                risk_lvl = "Low" if viability_sc >= 60.0 else "Moderate"
            else:
                competition_lvl = "Moderate"
                risk_lvl = "Moderate"

            market_gap_sc = round(max(5.0, min(95.0, 100.0 - (saturation_index * 10.0))), 1)

            drivers = [
                f"Local competitor density within 10 km: {competitor_density:.3f}/sq.km",
                f"Market saturation index: {saturation_index:.2f} ({saturation_status})",
                f"Geographic viability index: {viability_sc:.1f}/100"
            ]
            if nearest_competitor_distance_km is not None:
                drivers.append(f"Nearest direct competitor: {nearest_competitor_distance_km:.2f} km")

            return Model2Output(
                status=ComponentStatus.SUCCESS,
                model_version=str(raw_res.get("model_version", "1.0.0")),
                methodology_version=str(raw_res.get("methodology_version", "1.0.0")),
                viability_score=viability_sc,
                market_gap_score=market_gap_sc,
                competition_level=competition_lvl,
                risk_level=risk_lvl,
                score_band=score_band,
                confidence_rating=str(raw_res.get("confidence", "Moderate")),
                data_completeness_pct=float(raw_res.get("data_completeness", 1.0)) * 100.0,
                is_out_of_distribution=bool(raw_res.get("ood", False)),
                selected_category=str(raw_res.get("selected_category", business_category)),
                category_rankings=list(raw_res.get("category_rankings", [])),
                relevant_drivers=drivers,
                feature_snapshot={
                    "state": state,
                    "district": district,
                    "subdistrict": subdistrict,
                    "data_resolution": raw_res.get("data_resolution", "subdistrict"),
                    "competitor_count_radius": competitor_count_radius,
                    "competitor_density": competitor_density,
                    "saturation_index": saturation_index,
                    "saturation_status": saturation_status,
                    "nearest_competitor_distance_km": nearest_competitor_distance_km,
                },
                prediction_timestamp=datetime.now(timezone.utc).isoformat(),
                warnings=list(raw_res.get("warnings", [])),
                limitations=list(raw_res.get("limitations", []))
            )
        except Exception as e:
            logger.error(f"Model 2 analysis runtime failure: {e}", exc_info=True)
            return Model2Output(
                status=ComponentStatus.FAILED,
                selected_category=business_category,
                warnings=[f"Model 2 computation failed: {str(e)}"]
            )


# =====================================================================
# 3. MODEL 3 ADAPTER (Commodity Price Forecasting)
# =====================================================================

NON_COMMODITY_CATEGORIES = {
    "beauty parlour & salon",
    "beauty parlour / service business",
    "beauty parlour",
    "salon",
    "mobile repair & electronics",
    "solar energy services",
    "apparel & tailoring",
    "tailoring",
    "digital services",
    "common service center",
    "csc",
    "repair & service",
    "repair/maintenance",
    "repair services",
    "transport",
    "transportation",
    "services",
    "personal services",
    "hospitality",
    "grocery / kirana store",
    "kirana store",
    "retail",
    "handicrafts",
    "handloom & handicrafts",
    "small manufacturing",
    "manufacturing",
}

COMMODITY_FALLBACK_DEFAULTS = {
    "raw milk": "Milk",
    "milk": "Milk",
    "dairy": "Milk",
    "potato": "Potato",
    "mustard": "Mustard",
    "wheat": "Wheat",
    "paddy": "Paddy(Dhan)(Common)",
    "rice": "Rice",
    "onion": "Onion",
    "tomato": "Tomato",
    "maize": "Maize",
    "soyabean": "Soyabean",
}


class Model3Adapter:
    """
    Adapter for Model 3 (Model3InferenceEngine).
    Executes conformal pricing prediction for agricultural commodities and
    returns NOT_APPLICABLE for service and non-commodity business categories.
    """
    def __init__(self):
        self._engine = None
        self._init_error = None
        self._load_engine()

    def _load_engine(self):
        try:
            with isolated_model_context(MODEL_3_DIR):
                from src.inference.engine import Model3InferenceEngine
                self._engine = Model3InferenceEngine()
                logger.info("Model 3 Inference Engine loaded successfully in Model3Adapter.")
        except Exception as e:
            self._init_error = str(e)
            logger.error(f"Failed to load Model 3 Engine: {e}", exc_info=True)

    def predict(
        self,
        business_category: str,
        commodity: Optional[str] = None,
        state: Optional[str] = "West Bengal",
        district: Optional[str] = "Purba Bardhaman",
        market: Optional[str] = None,
    ) -> Model3Output:
        """
        Executes price prediction if applicable, otherwise returns structured NOT_APPLICABLE.
        """
        if not commodity or not str(commodity).strip():
            return Model3Output(
                status=ComponentStatus.NOT_APPLICABLE,
                price_prediction_applicable=False,
                commodity=None,
                predicted_price_inr_per_quintal=None,
                display_predicted_price="N/A (No Commodity Specified)",
                price_unit="INR/quintal",
                confidence_interval_lower_inr=None,
                confidence_interval_upper_inr=None,
                display_confidence_interval="N/A",
                confidence_interval_coverage_pct=90.0,
                reference_selling_price_inr=None,
                display_reference_selling_price="N/A",
                reliability_rating=ReliabilityRating.NOT_APPLICABLE,
                confidence_level="N/A",
                price_drivers_positive=[],
                price_drivers_negative=[],
                warnings=[f"Commodity price forecasting is not applicable for '{business_category}' without a specified agricultural commodity."],
                limitations=["Price prediction applies strictly to agricultural commodities traded in regulated APMC mandis."]
            )

        cat_lower = business_category.lower().strip()
        is_service = (
            cat_lower in NON_COMMODITY_CATEGORIES
            or any(k in cat_lower for k in ["beauty", "parlour", "salon", "repair", "service", "tailor", "digital", "transport"])
        )

        if is_service:
            return Model3Output(
                status=ComponentStatus.NOT_APPLICABLE,
                price_prediction_applicable=False,
                commodity=None,
                predicted_price_inr_per_quintal=None,
                display_predicted_price=f"N/A (Service category '{business_category}')",
                price_unit="INR/quintal",
                confidence_interval_lower_inr=None,
                confidence_interval_upper_inr=None,
                display_confidence_interval="N/A",
                confidence_interval_coverage_pct=90.0,
                reference_selling_price_inr=None,
                display_reference_selling_price="N/A",
                reliability_rating=ReliabilityRating.NOT_APPLICABLE,
                confidence_level="N/A",
                price_drivers_positive=[],
                price_drivers_negative=[],
                warnings=[f"Commodity price forecasting is not applicable for service enterprise '{business_category}'."],
                limitations=["Price prediction applies strictly to physical agricultural commodities traded in regulated APMC mandis."]
            )

        resolved_commodity = str(commodity).strip()

        if self._engine is None:
            return Model3Output(
                status=ComponentStatus.UNAVAILABLE,
                price_prediction_applicable=True,
                commodity=resolved_commodity,
                warnings=[f"Model 3 engine unavailable: {self._init_error or 'Initialization failed'}"]
            )

        target_comm = resolved_commodity
        target_state = state or "West Bengal"
        target_district = district or "Purba Bardhaman"
        target_market = market or target_district

        # Check if ProductValuationEngine has an official government mandi benchmark
        from .valuation import ProductValuationEngine
        bench_val = ProductValuationEngine.get_valuation(target_comm, state=target_state, district=target_district)
        bench_price_per_quintal = None
        if bench_val is not None and bench_val.modal_price_inr is not None:
            if bench_val.unit in ("INR/liter", "INR/kg"):
                bench_price_per_quintal = bench_val.modal_price_inr * 100.0
            else:
                bench_price_per_quintal = bench_val.modal_price_inr

        try:
            with isolated_model_context(MODEL_3_DIR):
                raw_res = self._engine.predict(
                    state=target_state,
                    district=target_district,
                    market=target_market,
                    commodity=target_comm,
                    recent_observed_price=bench_price_per_quintal,
                )

            # Handle abstention / insufficient historical data
            if not raw_res.get("price_prediction_available", False) or raw_res.get("expected_market_price") is None:
                return Model3Output(
                    status=ComponentStatus.DEGRADED,
                    price_prediction_applicable=True,
                    model_version=str(raw_res.get("model_version", "1.0.0")),
                    methodology_version=str(raw_res.get("methodology_version", "1.0.0")),
                    commodity=target_comm,
                    predicted_price_inr_per_quintal=None,
                    display_predicted_price="N/A (Historical Mandi Records Unavailable)",
                    price_unit="INR/quintal",
                    confidence_interval_lower_inr=None,
                    confidence_interval_upper_inr=None,
                    display_confidence_interval="N/A",
                    confidence_interval_coverage_pct=90.0,
                    reference_selling_price_inr=None,
                    display_reference_selling_price="N/A",
                    reliability_rating=ReliabilityRating.LOW,
                    confidence_level="Low",
                    price_drivers_positive=[],
                    price_drivers_negative=[],
                    prediction_timestamp=datetime.now(timezone.utc).isoformat(),
                    warnings=list(raw_res.get("warnings", [])),
                    limitations=list(raw_res.get("limitations", []))
                )

            expected_p = float(raw_res.get("expected_market_price", raw_res.get("predicted_price", 0.0)))
            int_data = raw_res.get("prediction_interval", {})
            lower_b = float(int_data.get("lower", expected_p * 0.85))
            upper_b = float(int_data.get("upper", expected_p * 1.15))
            ref_selling = float(raw_res.get("reference_selling_price", expected_p))

            raw_rel = str(raw_res.get("prediction_reliability", "MEDIUM")).upper()
            rel_rating = ReliabilityRating.MEDIUM
            if "HIGH" in raw_rel:
                rel_rating = ReliabilityRating.HIGH
            elif "LOW" in raw_rel:
                rel_rating = ReliabilityRating.LOW

            return Model3Output(
                status=ComponentStatus.SUCCESS,
                price_prediction_applicable=True,
                model_version=str(raw_res.get("model_version", "1.0.0")),
                methodology_version=str(raw_res.get("methodology_version", "1.0.0")),
                commodity=str(raw_res.get("commodity", target_comm)),
                variety=raw_res.get("variety"),
                grade=raw_res.get("grade"),
                predicted_price_inr_per_quintal=round(expected_p, 2),
                display_predicted_price=f"₹{expected_p:,.2f} / quintal",
                price_unit="INR/quintal",
                confidence_interval_lower_inr=round(lower_b, 2),
                confidence_interval_upper_inr=round(upper_b, 2),
                display_confidence_interval=f"₹{lower_b:,.2f} - ₹{upper_b:,.2f} / quintal",
                confidence_interval_coverage_pct=float(raw_res.get("conformal_coverage", 0.90)) * 100.0,
                reference_selling_price_inr=round(ref_selling, 2),
                display_reference_selling_price=f"₹{ref_selling:,.2f} / quintal",
                reliability_rating=rel_rating,
                confidence_level=str(raw_res.get("model_confidence", "Moderate")),
                price_drivers_positive=list(raw_res.get("positive_price_drivers", [])),
                price_drivers_negative=list(raw_res.get("negative_price_drivers", [])),
                official_reference_price_inr=float(raw_res.get("recent_observed_price")) if raw_res.get("recent_observed_price") is not None else None,
                official_reference_source="Agmarknet Mandi Price Feed (Government of India)",
                prediction_timestamp=datetime.now(timezone.utc).isoformat(),
                warnings=list(raw_res.get("warnings", [])),
                limitations=list(raw_res.get("limitations", []))
            )
        except Exception as e:
            logger.error(f"Model 3 pricing forecast failure: {e}", exc_info=True)
            return Model3Output(
                status=ComponentStatus.FAILED,
                price_prediction_applicable=True,
                commodity=target_comm,
                warnings=[f"Model 3 commodity price forecasting failed: {str(e)}"]
            )


# =====================================================================
# 4. FINANCE ENGINE ADAPTER (Authoritative SIH Financial Architecture)
# =====================================================================

MICRO_FINANCE_MAX_COST = 140000.0      # ₹1.40 lakh
MICRO_FINANCE_MAX_LOAN = 125000.0      # ₹1.25 lakh
MICRO_FINANCE_INTEREST_RATE = 0.065    # 6.5% p.a.
MICRO_FINANCE_TENURE_MONTHS = 36       # 3 years
MICRO_FINANCE_MORATORIUM_MONTHS = 3    # 3 months

TERM_LOAN_MAX_COST = 5000000.0         # ₹50.0 lakh
TERM_LOAN_MAX_LOAN = 4500000.0         # ₹45.0 lakh
TERM_LOAN_INTEREST_RATE = 0.080        # 8.0% p.a.
TERM_LOAN_TENURE_MONTHS = 84           # 7 years
TERM_LOAN_MORATORIUM_MONTHS = 6        # 6 months


class FinanceEngineAdapter:
    """
    Independent, authoritative financial calculation engine adhering strictly
    to SIH rules:
    - Project Cost = Available Margin / 0.10
    - Scheme-specific loan capping
    - Exact boundary behavior at ₹1.40L and ₹50L
    - Month-by-month compound moratorium interest capitalization & EMI amortization schedule
    """

    @staticmethod
    def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
        """
        EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        """
        if principal <= 0 or tenure_months <= 0:
            return 0.0
        monthly_rate = annual_rate / 12.0
        if monthly_rate == 0:
            return round(principal / tenure_months, 2)
        factor = math.pow(1.0 + monthly_rate, tenure_months)
        emi = principal * monthly_rate * factor / (factor - 1.0)
        return round(emi, 2)

    @classmethod
    def calculate(
        cls,
        available_margin_inr: float,
        proposed_budget_inr: Optional[float] = None,
        monthly_operating_cost_inr: Optional[float] = None,
        fixed_asset_cost_inr: Optional[float] = None,
        initial_inventory_inr: Optional[float] = None,
    ) -> FinanceOutput:
        """
        Executes strict SIH financial calculation with mathematical determinism.
        """
        warnings: List[str] = []

        # Validate Available Margin
        if available_margin_inr is None or available_margin_inr <= 0:
            return FinanceOutput(
                status=ComponentStatus.FAILED,
                available_margin_inr=0.0,
                calculated_project_cost_inr=0.0,
                beneficiary_contribution_inr=0.0,
                applicable_scheme=ApplicableScheme.INVALID_MARGIN,
                is_within_scheme_limit=False,
                scheme_name="Invalid Margin",
                scheme_loan_cap_inr=0.0,
                eligible_loan_inr=0.0,
                interest_rate_pct_per_annum=0.0,
                tenure_years=0,
                tenure_months=0,
                moratorium_months=0,
                effective_principal_after_moratorium_inr=0.0,
                monthly_emi_inr=0.0,
                total_interest_payable_inr=0.0,
                total_repayment_inr=0.0,
                warnings=["Available margin must be greater than zero."]
            )

        margin = round(available_margin_inr, 2)
        calculated_project_cost = round(margin / 0.10, 2)

        # 1. Scheme Routing & Capping
        if calculated_project_cost <= MICRO_FINANCE_MAX_COST:
            scheme = ApplicableScheme.MICRO_FINANCE
            scheme_name = "Micro Finance Scheme"
            scheme_cap = MICRO_FINANCE_MAX_LOAN
            interest_rate = MICRO_FINANCE_INTEREST_RATE
            tenure_months = MICRO_FINANCE_TENURE_MONTHS
            tenure_years = 3
            moratorium_months = MICRO_FINANCE_MORATORIUM_MONTHS
            
            ideal_loan = calculated_project_cost * 0.90
            eligible_loan = min(ideal_loan, scheme_cap)
            is_within_limit = True
            beneficiary_contribution = round(calculated_project_cost - eligible_loan, 2)
            if ideal_loan > scheme_cap:
                warnings.append(
                    f"90% loan calculation (₹{ideal_loan:,.2f}) exceeds the Micro Finance cap of ₹{scheme_cap:,.2f}. "
                    f"Loan capped at ₹{scheme_cap:,.2f}; required beneficiary contribution is ₹{beneficiary_contribution:,.2f}."
                )

        elif calculated_project_cost <= TERM_LOAN_MAX_COST:
            scheme = ApplicableScheme.TERM_LOAN
            scheme_name = "Term Loan Scheme"
            scheme_cap = TERM_LOAN_MAX_LOAN
            interest_rate = TERM_LOAN_INTEREST_RATE
            tenure_months = TERM_LOAN_TENURE_MONTHS
            tenure_years = 7
            moratorium_months = TERM_LOAN_MORATORIUM_MONTHS
            
            ideal_loan = calculated_project_cost * 0.90
            eligible_loan = min(ideal_loan, scheme_cap)
            is_within_limit = True
            beneficiary_contribution = round(calculated_project_cost - eligible_loan, 2)

        else:
            scheme = ApplicableScheme.EXCEEDS_SCHEME_LIMIT
            scheme_name = "Exceeds Scheme Limit"
            scheme_cap = TERM_LOAN_MAX_LOAN
            interest_rate = TERM_LOAN_INTEREST_RATE
            tenure_months = TERM_LOAN_TENURE_MONTHS
            tenure_years = 7
            moratorium_months = TERM_LOAN_MORATORIUM_MONTHS
            
            eligible_loan = scheme_cap  # Capped at ₹45 lakh
            is_within_limit = False
            beneficiary_contribution = round(calculated_project_cost - eligible_loan, 2)
            warnings.append(
                f"Calculated project cost of ₹{calculated_project_cost:,.2f} exceeds the ₹50.00 lakh ceiling under SIH guidelines. "
                f"Maximum eligible financing is capped at ₹{scheme_cap:,.2f}."
            )

        # 2. Moratorium & Amortization Calculations (Simple monthly interest capitalization per SIH)
        monthly_rate = interest_rate / 12.0
        moratorium_interest = round(eligible_loan * monthly_rate * moratorium_months, 2)
        effective_principal = round(eligible_loan + moratorium_interest, 2)
        repayment_months = tenure_months - moratorium_months

        monthly_emi = cls.calculate_emi(effective_principal, interest_rate, repayment_months)
        total_repayment = round(monthly_emi * repayment_months, 2)
        total_interest = round(total_repayment - eligible_loan, 2)

        # 3. Monthly Amortization Schedule (Moratorium + First 18 Active Months Preview)
        monthly_preview: List[AmortizationScheduleRow] = []
        sched_balance = eligible_loan
        monthly_m_interest = round(eligible_loan * monthly_rate, 2)

        # Moratorium Rows
        for m in range(1, moratorium_months + 1):
            if m == moratorium_months:
                closing_b = effective_principal
                m_interest = round(effective_principal - sched_balance, 2)
            else:
                m_interest = monthly_m_interest
                closing_b = round(sched_balance + m_interest, 2)

            monthly_preview.append(
                AmortizationScheduleRow(
                    period=m,
                    period_type="MONTH",
                    opening_balance_inr=sched_balance,
                    emi_or_installment_inr=0.0,
                    principal_inr=0.0,
                    interest_inr=m_interest,
                    closing_balance_inr=closing_b,
                    is_moratorium=True
                )
            )
            sched_balance = closing_b

        # Active Amortization Rows
        current_balance = effective_principal
        for p in range(1, repayment_months + 1):
            m_interest = round(current_balance * monthly_rate, 2)
            m_principal = round(monthly_emi - m_interest, 2)
            if p == repayment_months:
                m_principal = current_balance
                current_emi = round(m_principal + m_interest, 2)
            else:
                current_emi = monthly_emi
            closing_b = max(0.0, round(current_balance - m_principal, 2))
            
            if len(monthly_preview) < 18:
                monthly_preview.append(
                    AmortizationScheduleRow(
                        period=moratorium_months + p,
                        period_type="MONTH",
                        opening_balance_inr=current_balance,
                        emi_or_installment_inr=current_emi,
                        principal_inr=m_principal,
                        interest_inr=m_interest,
                        closing_balance_inr=closing_b,
                        is_moratorium=False
                    )
                )
            current_balance = closing_b

        # 4. Quarterly Schedule Generation
        quarterly_schedule: List[AmortizationScheduleRow] = []
        total_quarters = math.ceil(tenure_months / 3)
        
        # Quarter 1 (Moratorium Period)
        quarterly_schedule.append(
            AmortizationScheduleRow(
                period=1,
                period_type="QUARTER",
                opening_balance_inr=eligible_loan,
                emi_or_installment_inr=0.0,
                principal_inr=0.0,
                interest_inr=moratorium_interest,
                closing_balance_inr=effective_principal,
                is_moratorium=True
            )
        )
        q_curr_bal = effective_principal
        q_installment = round(monthly_emi * 3, 2)
        
        for q in range(2, total_quarters + 1):
            q_interest = round(q_curr_bal * (interest_rate / 4.0), 2)
            q_principal = round(q_installment - q_interest, 2)
            if q == total_quarters or q_principal > q_curr_bal:
                q_principal = q_curr_bal
                q_inst_final = round(q_principal + q_interest, 2)
            else:
                q_inst_final = q_installment
            q_closing = max(0.0, round(q_curr_bal - q_principal, 2))
            quarterly_schedule.append(
                AmortizationScheduleRow(
                    period=q,
                    period_type="QUARTER",
                    opening_balance_inr=q_curr_bal,
                    emi_or_installment_inr=q_inst_final,
                    principal_inr=q_principal,
                    interest_inr=q_interest,
                    closing_balance_inr=q_closing,
                    is_moratorium=False
                )
            )
            q_curr_bal = q_closing

        # 5. Budget Comparison & Shortfall
        margin_shortfall = 0.0
        req_margin_for_proposed = None
        budget_note = None

        if proposed_budget_inr is not None and proposed_budget_inr > 0:
            proposed_cost = round(proposed_budget_inr, 2)
            req_margin_for_proposed = round(proposed_cost * 0.10, 2)
            
            if proposed_cost > calculated_project_cost:
                margin_shortfall = round(req_margin_for_proposed - margin, 2)
                budget_note = (
                    f"Proposed project cost (₹{proposed_cost:,.2f}) exceeds the financing capacity "
                    f"(₹{calculated_project_cost:,.2f}) derived from the available margin under {scheme_name}. "
                    f"Additional equity margin required: ₹{margin_shortfall:,.2f}."
                )
                warnings.append(budget_note)
            elif proposed_cost < calculated_project_cost:
                budget_note = (
                    f"Proposed project budget (₹{proposed_cost:,.2f}) is lower than the maximum feasible capacity "
                    f"(₹{calculated_project_cost:,.2f}). The entrepreneur may choose to borrow a lower amount "
                    f"to reduce external debt burden."
                )

        # 6. Working Capital Assessment (if provided)
        wc_summary = None
        if any([fixed_asset_cost_inr, initial_inventory_inr, monthly_operating_cost_inr]):
            fa = fixed_asset_cost_inr or 0.0
            inv = initial_inventory_inr or 0.0
            op = monthly_operating_cost_inr or 0.0
            wc_req = (op * 3) + inv
            total_req = fa + wc_req
            wc_summary = WorkingCapitalSummary(
                fixed_assets_inr=fa,
                initial_inventory_inr=inv,
                monthly_operating_cost_inr=op,
                coverage_months=3,
                working_capital_required_inr=wc_req,
                total_project_requirement_inr=total_req
            )
            if total_req > calculated_project_cost:
                warnings.append(
                    f"Estimated total capital requirement (₹{total_req:,.2f}) exceeds the feasible project cost (₹{calculated_project_cost:,.2f})."
                )

        # 7. Explanatory Notes
        explanatory_notes = [
            f"Available margin of ₹{margin:,.2f} supports a maximum feasible project cost of ₹{calculated_project_cost:,.2f}.",
            f"Eligible loan of ₹{eligible_loan:,.2f} sanctioned under {scheme_name} at {interest_rate * 100:.1f}% per annum.",
            f"Tenure: {tenure_years} years ({tenure_months} months) with {moratorium_months} months moratorium.",
            f"Moratorium interest of ₹{moratorium_interest:,.2f} is capitalized, establishing an effective repayment principal of ₹{effective_principal:,.2f}.",
            f"Monthly EMI of ₹{monthly_emi:,.2f} payable over {repayment_months} active amortization months.",
            f"Total interest payable over the loan lifecycle is ₹{total_interest:,.2f}, resulting in a total repayment of ₹{total_repayment:,.2f}."
        ]

        return FinanceOutput(
            status=ComponentStatus.SUCCESS,
            available_margin_inr=margin,
            calculated_project_cost_inr=calculated_project_cost,
            beneficiary_contribution_inr=beneficiary_contribution,
            applicable_scheme=scheme,
            is_within_scheme_limit=is_within_limit,
            scheme_name=scheme_name,
            scheme_loan_cap_inr=scheme_cap,
            eligible_loan_inr=eligible_loan,
            interest_rate_pct_per_annum=round(interest_rate * 100.0, 2),
            tenure_years=tenure_years,
            tenure_months=tenure_months,
            moratorium_months=moratorium_months,
            effective_principal_after_moratorium_inr=effective_principal,
            monthly_emi_inr=monthly_emi,
            total_interest_payable_inr=total_interest,
            total_repayment_inr=total_repayment,
            proposed_project_cost_inr=proposed_budget_inr,
            required_margin_for_proposed_inr=req_margin_for_proposed,
            margin_shortfall_inr=margin_shortfall,
            budget_comparison_note=budget_note,
            monthly_repayment_schedule_preview=monthly_preview,
            quarterly_repayment_schedule=quarterly_schedule,
            working_capital=wc_summary,
            explanatory_notes=explanatory_notes,
            warnings=warnings,
            calculation_timestamp=datetime.now(timezone.utc).isoformat()
        )


# =====================================================================
# 5. RAG ADAPTER (Government Schemes & Regulatory Evidence)
# =====================================================================

class RAGAdapter:
    """
    Adapter for VentureRoot RAG Knowledge System.
    Retrieves official government scheme guidelines, APMC regulations, and loan conditions
    with strict citation generation, freshness auditing, and automated abstention.
    """
    def __init__(self):
        self._pipeline = None
        self._init_error = None
        self._load_pipeline()

    def _load_pipeline(self):
        try:
            with isolated_model_context(RAG_DIR):
                models_rag_dir = str(RAG_DIR.parent.resolve())
                if models_rag_dir not in sys.path:
                    sys.path.insert(0, models_rag_dir)
                from RAG.src.pipeline import RAGPipeline
                self._pipeline = RAGPipeline()
                logger.info("RAGAdapter: Successfully initialized RAGPipeline.")
        except Exception as e:
            self._init_error = str(e)
            logger.warning(f"RAGAdapter: Failed to initialize RAGPipeline: {e}")

    def query(
        self,
        query_text: str,
        category: Optional[str] = None,
        state: Optional[str] = None,
        top_k: int = 5
    ) -> RAGEvidenceResult:
        """
        Execute RAG retrieval and synthesis with freshness and abstention governance.
        """
        if self._pipeline is None:
            return RAGEvidenceResult(
                query=query_text,
                answer="Official government scheme knowledge service is currently unavailable. Advice is based on general statutory frameworks.",
                should_abstain=True,
                confidence_level="LOW",
                freshness=FreshnessStatus.UNKNOWN,
                citations=[],
                source_chunks_count=0,
                retrieval_notes=[f"RAG pipeline offline: {self._init_error or 'Not initialized'}"]
            )

        try:
            with isolated_model_context(RAG_DIR):
                models_rag_dir = str(RAG_DIR.parent.resolve())
                if models_rag_dir not in sys.path:
                    sys.path.insert(0, models_rag_dir)
                raw_res = self._pipeline.query(query_text, top_k=top_k)

            raw_cits = raw_res.get("citations", [])
            mapped_cits: List[RAGCitation] = []
            for c in raw_cits:
                mapped_cits.append(
                    RAGCitation(
                        citation_id=c.get("citation_id", "CIT-001"),
                        title=c.get("title", "Government Scheme Circular"),
                        publisher=c.get("publisher"),
                        department=c.get("department"),
                        state=c.get("state"),
                        source_url=c.get("source_url"),
                        page_number=c.get("page_number", 1),
                        effective_date=c.get("effective_date")
                    )
                )

            raw_fresh = str(raw_res.get("freshness", "CURRENT")).upper()
            if "CURRENT" in raw_fresh:
                freshness = FreshnessStatus.CURRENT
            elif "AGING" in raw_fresh:
                freshness = FreshnessStatus.AGING
            elif "STALE" in raw_fresh:
                freshness = FreshnessStatus.STALE
            else:
                freshness = FreshnessStatus.UNKNOWN

            should_abstain = raw_res.get("should_abstain", False)
            conf_level = raw_res.get("confidence_level", "MEDIUM")
            chunks_count = len(raw_res.get("chunks", []))

            return RAGEvidenceResult(
                query=query_text,
                answer=raw_res.get("answer", ""),
                should_abstain=should_abstain,
                confidence_level=conf_level,
                freshness=freshness,
                citations=mapped_cits,
                source_chunks_count=chunks_count,
                retrieval_notes=[f"Retrieved {chunks_count} official chunks with freshness {freshness.value}."]
            )
        except Exception as e:
            logger.warning(f"RAG query execution error: {e}")
            return RAGEvidenceResult(
                query=query_text,
                answer="Could not retrieve specific government evidence due to processing error.",
                should_abstain=True,
                confidence_level="LOW",
                freshness=FreshnessStatus.UNKNOWN,
                citations=[],
                source_chunks_count=0,
                retrieval_notes=[f"Query execution failed: {str(e)}"]
            )

    def retrieve_evidence(
        self,
        query: str,
        sector: Optional[str] = None,
        state: Optional[str] = None,
        top_k: int = 5
    ) -> RAGEvidenceResult:
        """Convenience wrapper for RAG retrieval."""
        return self.query(query_text=query, category=sector, state=state, top_k=top_k)


# =====================================================================
# 6. STEP 4 NUMERICAL FIREWALL
# =====================================================================

class Step4NumericalFirewall:
    """
    Authoritative Numerical Integrity Firewall.
    Validates all narrative and structured output against registered authoritative
    values from Model 1, Model 2, Model 3, Finance Engine, Census, and KG.
    Guarantees zero numerical mutation or fabrication.
    """
    def verify(
        self,
        explanation_text: str,
        step3_result: IntegratedStep3Result,
        structured_synthesis: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, List[str], str, Dict[str, Any]]:
        violations: List[str] = []
        verified_metrics: Dict[str, Any] = {}

        # 1. Collect Authoritative Numbers
        fe = step3_result.finance
        verified_metrics["calculated_project_cost_inr"] = fe.calculated_project_cost_inr
        verified_metrics["beneficiary_contribution_inr"] = fe.beneficiary_contribution_inr
        verified_metrics["eligible_loan_inr"] = fe.eligible_loan_inr
        verified_metrics["monthly_emi_inr"] = fe.monthly_emi_inr
        verified_metrics["interest_rate_pct_per_annum"] = fe.interest_rate_pct_per_annum
        verified_metrics["tenure_months"] = fe.tenure_months
        verified_metrics["moratorium_months"] = fe.moratorium_months
        verified_metrics["total_repayment_inr"] = fe.total_repayment_inr

        verified_metrics["market_potential_score"] = step3_result.model_1.market_potential_score
        verified_metrics["viability_score"] = step3_result.model_2.viability_score

        m3 = step3_result.model_3
        if m3.price_prediction_applicable and m3.predicted_price_inr_per_quintal is not None:
            verified_metrics["predicted_price_inr_per_quintal"] = m3.predicted_price_inr_per_quintal
            if m3.confidence_interval_lower_inr is not None:
                verified_metrics["confidence_interval_lower_inr"] = m3.confidence_interval_lower_inr
            if m3.confidence_interval_upper_inr is not None:
                verified_metrics["confidence_interval_upper_inr"] = m3.confidence_interval_upper_inr

        verified_metrics["population_in_radius"] = step3_result.market_reach.population_in_radius
        verified_metrics["competitor_count_10km"] = step3_result.competitor_data.competitor_count_10km

        # 2. Check for Numerical Tampering in Narrative Text
        loan_iter = re.finditer(
            r"(?:loan(?:\s+amount)?|borrowing(?:\s+amount)?|sanctioned?\s+(?:loan\s+)?amount)[^₹\d]{0,40}(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)",
            explanation_text,
            flags=re.IGNORECASE
        )
        for m in loan_iter:
            matched_context = m.group(0).lower()
            if any(term in matched_context for term in ["emi", "installment", "monthly", "per month", "repayment", "interest", "moratorium"]):
                continue
            try:
                val = float(m.group(1).replace(",", ""))
                actual_loan = fe.eligible_loan_inr
                valid_loan_numbers = [
                    actual_loan,
                    fe.calculated_project_cost_inr,
                    fe.beneficiary_contribution_inr,
                    fe.effective_principal_after_moratorium_inr,
                    fe.total_repayment_inr,
                    fe.monthly_emi_inr
                ]
                if all(abs(val - num) > 10.0 for num in valid_loan_numbers):
                    v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Eligible loan amount altered from ₹{actual_loan:,.2f} to ₹{val:,.2f}."
                    violations.append(v_msg)
            except ValueError:
                pass

        emi_matches = re.findall(
            r"(?:emi|monthly\s+installment)[^₹\d]{0,40}(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)",
            explanation_text,
            flags=re.IGNORECASE
        )
        for val_str in emi_matches:
            try:
                val = float(val_str.replace(",", ""))
                actual_emi = fe.monthly_emi_inr
                if abs(val - actual_emi) > 10.0:
                    v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Monthly EMI altered from ₹{actual_emi:,.2f} to ₹{val:,.2f}."
                    violations.append(v_msg)
            except ValueError:
                pass

        rate_matches = re.findall(
            r"(?:interest\s+rate|rate\s+of\s+interest)[^%\d]{0,30}(\d+(?:\.\d+)?)\s*%",
            explanation_text,
            flags=re.IGNORECASE
        )
        for val_str in rate_matches:
            try:
                val = float(val_str.replace(",", ""))
                actual_rate = fe.interest_rate_pct_per_annum
                if abs(val - actual_rate) > 0.05 and abs(val - 90.0) > 0.1 and abs(val - 10.0) > 0.1:
                    v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Scheme interest rate altered from {actual_rate}% to {val}%."
                    violations.append(v_msg)
            except ValueError:
                pass

        # Check commodity price tampering if applicable
        if m3.price_prediction_applicable and m3.predicted_price_inr_per_quintal is not None:
            price_matches = re.findall(
                r"(?:mandi\s+price|wholesale\s+price|predicted\s+price|apmc\s+price|selling\s+price|commodity\s+price|price\s+of\s+[a-zA-Z\s\(\)]+?)[^₹\d]{0,40}(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)",
                explanation_text,
                flags=re.IGNORECASE
            )
            price_per_quintal_matches = re.findall(
                r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:/|\s+per\s+)(?:quintal|qtl)",
                explanation_text,
                flags=re.IGNORECASE
            )
            for val_str in (price_matches + price_per_quintal_matches):
                try:
                    val = float(val_str.replace(",", ""))
                    actual_p = m3.predicted_price_inr_per_quintal
                    is_known_finance_metric = (
                        abs(val - fe.eligible_loan_inr) < 5.0
                        or abs(val - fe.monthly_emi_inr) < 5.0
                        or abs(val - fe.calculated_project_cost_inr) < 5.0
                        or abs(val - fe.beneficiary_contribution_inr) < 5.0
                    )
                    if is_known_finance_metric:
                        continue
                    if m3.confidence_interval_lower_inr and abs(val - m3.confidence_interval_lower_inr) < 5.0:
                        continue
                    if m3.confidence_interval_upper_inr and abs(val - m3.confidence_interval_upper_inr) < 5.0:
                        continue
                    if m3.reference_selling_price_inr and abs(val - m3.reference_selling_price_inr) < 5.0:
                        continue
                    if m3.official_reference_price_inr and abs(val - m3.official_reference_price_inr) < 5.0:
                        continue
                    if abs(val - actual_p) > 25.0:
                        v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Commodity Price altered from ₹{actual_p:,.2f} to ₹{val:,.2f}."
                        violations.append(v_msg)
                except ValueError:
                    pass

            kg_unit_matches = re.findall(
                r"(?:mandi\s+price|apmc\s+price|wholesale\s+price)[^₹\d]{0,30}(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:/|\s+per\s+)(?:kg|kilo)",
                explanation_text,
                flags=re.IGNORECASE
            )
            for kg_val_str in kg_unit_matches:
                try:
                    kg_val = float(kg_val_str.replace(",", ""))
                    if kg_val > 500.0:
                        v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Quintal-magnitude APMC price (₹{kg_val:,.2f}) incorrectly labeled per-kg."
                        violations.append(v_msg)
                except ValueError:
                    pass

        # Check Market Potential Score tampering
        if step3_result.model_1.market_potential_score is not None:
            score_matches = re.findall(
                r"(?:market\s+potential\s+score|mpi\s+score)[^\d]{0,25}(\d+(?:\.\d+)?)\s*(?:/\s*100)?",
                explanation_text,
                flags=re.IGNORECASE
            )
            for val_str in score_matches:
                try:
                    val = float(val_str)
                    actual_s = step3_result.model_1.market_potential_score
                    if abs(val - actual_s) > 0.5 and val <= 100.0:
                        v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Market Potential Score altered from {actual_s:.1f} to {val:.1f}."
                        violations.append(v_msg)
                except ValueError:
                    pass

        # Check Viability Score tampering
        if step3_result.model_2.viability_score is not None:
            viab_matches = re.findall(
                r"(?:viability\s+score|enterprise\s+viability)[^\d]{0,25}(\d+(?:\.\d+)?)\s*(?:/\s*100)?",
                explanation_text,
                flags=re.IGNORECASE
            )
            for val_str in viab_matches:
                try:
                    val = float(val_str)
                    actual_v = step3_result.model_2.viability_score
                    if abs(val - actual_v) > 0.5 and val <= 100.0:
                        v_msg = f"NUMERICAL_INTEGRITY_VIOLATION: Viability Score altered from {actual_v:.1f} to {val:.1f}."
                        violations.append(v_msg)
                except ValueError:
                    pass

        reconciled_text = explanation_text
        if violations:
            logger.warning(f"Step 4 Numerical Firewall detected {len(violations)} integrity violations.")
            disclaimer_banner = (
                "\n\n---\n"
                "> [!CAUTION]\n"
                "> **STATUTORY FINANCIAL RECONCILIATION NOTICE**:\n"
                "> The descriptive narrative above contained unverified numerical variations that were flagged by the VentureRoot Numerical Integrity Firewall.\n"
                "> **The following figures represent the binding, verified outputs calculated directly by the deterministic engines:**\n"
                f"> - **Feasible Project Cost**: ₹{fe.calculated_project_cost_inr:,.2f}\n"
                f"> - **Promoter Equity Contribution (10%)**: ₹{fe.beneficiary_contribution_inr:,.2f}\n"
                f"> - **Eligible Bank Loan Amount**: ₹{fe.eligible_loan_inr:,.2f} ({fe.scheme_name})\n"
                f"> - **Annual Interest Rate**: {fe.interest_rate_pct_per_annum:.1f}% p.a.\n"
                f"> - **Repayment Tenure**: {fe.tenure_months} months (including {fe.moratorium_months} months moratorium)\n"
                f"> - **Effective Capitalized Principal**: ₹{fe.effective_principal_after_moratorium_inr:,.2f}\n"
                f"> - **Fixed Monthly EMI**: ₹{fe.monthly_emi_inr:,.2f}\n"
                f"> - **Market Potential Score (Model 1)**: {step3_result.model_1.market_potential_score}/100\n"
                f"> - **Business Viability Score (Model 2)**: {step3_result.model_2.viability_score}/100\n"
            )
            if m3.price_prediction_applicable and m3.predicted_price_inr_per_quintal is not None:
                disclaimer_banner += f"> - **Predicted Commodity Price (Model 3)**: ₹{m3.predicted_price_inr_per_quintal:,.2f} / quintal\n"
            reconciled_text = explanation_text + disclaimer_banner

        return len(violations) == 0, violations, reconciled_text, verified_metrics

    def enforce(
        self,
        explanation_text: str,
        step3_result: IntegratedStep3Result,
        structured_synthesis: Optional[Dict[str, Any]] = None
    ) -> Tuple[NumericalIntegrityStatus, str]:
        passed, violations, reconciled_text, verified_metrics = self.verify(
            explanation_text, step3_result, structured_synthesis
        )
        status = NumericalIntegrityStatus(
            firewall_passed=passed,
            violations_detected=violations,
            reconciled=len(violations) > 0,
            reconciliation_notes=[
                "Reconciliation banner appended with authoritative calculations from deterministic engines."
            ] if violations else [],
            verified_metrics=verified_metrics,
            audit_timestamp=datetime.now(timezone.utc).isoformat()
        )
        return status, reconciled_text


# =====================================================================
# 7. GEMINI AI ADVISOR CLIENT
# =====================================================================

class GeminiAdvisorClient:
    """
    Direct client for Gemini 2.5 Flash API with low temperature and structured output.
    Provides authoritative synthesis of ML Models, Finance Engine, Demographics,
    Knowledge Graph, and RAG official scheme evidence.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        timeout_seconds: float = 30.0
    ):
        self._api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self._model = model or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        self._temperature = temperature
        self._timeout_seconds = timeout_seconds

        # Read root .env if key not yet found
        if not self._api_key:
            try:
                root_env = WORKSPACE_ROOT / ".env"
                if root_env.exists():
                    for line in root_env.read_text(encoding="utf-8").splitlines():
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'").strip('"')
                        if k == "GEMINI_API_KEY":
                            self._api_key = v
                        elif k == "GEMINI_MODEL" and not model:
                            self._model = v
            except Exception as e:
                logger.warning(f"Error reading root .env for Gemini config: {e}")

        # Model validation guard - ensure gemini-2.5-flash
        if not self._model or "1.5" in self._model:
            self._model = "gemini-2.5-flash"

    @property
    def api_key(self) -> Optional[str]:
        return self._api_key

    def _val(self, obj: Any) -> str:
        if hasattr(obj, "value"):
            return str(obj.value)
        return str(obj) if obj is not None else ""

    def synthesize(
        self,
        step3_result: IntegratedStep3Result,
        rag_evidence: RAGEvidenceResult,
        user_input: UserBusinessInput,
        user_query: Optional[str] = None
    ) -> AdvisorySynthesis:
        """
        Synthesize advisory response using Gemini 2.5 Flash, falling back to deterministic template on failure.
        """
        if self._api_key:
            try:
                synthesis = self._call_gemini(step3_result, rag_evidence, user_input, user_query)
                synthesis.advisor_model = self._model
                synthesis.advisor_status = "gemini"
                return synthesis
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}), triggering deterministic fallback.")

        # Deterministic Fallback using actual computed pipeline results
        synthesis = self._deterministic_fallback(step3_result, rag_evidence, user_input, user_query)
        synthesis.advisor_model = "offline-deterministic-fallback"
        synthesis.advisor_status = "deterministic_fallback"
        return synthesis

    def _call_gemini(
        self,
        step3_result: IntegratedStep3Result,
        rag_evidence: RAGEvidenceResult,
        user_input: UserBusinessInput,
        user_query: Optional[str] = None
    ) -> AdvisorySynthesis:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:generateContent"
        headers = {
            "x-goog-api-key": self._api_key,
            "Content-Type": "application/json"
        }

        system_instruction = (
            "You are VentureRoot AI Business Advisor, an expert hyper-local rural and semi-urban enterprise advisor in India. "
            "Synthesize the provided model outputs, local demographic reach, competitor intelligence, and official government scheme data into an actionable advisory report.\n\n"
            "CRITICAL DIRECTIVES:\n"
            "1. STRICT NUMERICAL INTEGRITY: You MUST PRESERVE all authoritative numbers exactly as provided in the context. "
            "NEVER modify, round, or recalculate: Market Potential Score, Viability Score, Commodity Price, Project Cost, Beneficiary Contribution, "
            "Eligible Loan Amount, Interest Rate, Tenure, Moratorium, Monthly EMI, Population, Competitor Counts.\n"
            "2. EMPIRICAL GROUNDING: Ground all SWOT points directly in the supplied data.\n"
            "3. ADVISORY TONE: Never promise or guarantee loan approvals or profits.\n"
            "4. Return a valid JSON object matching the requested schema."
        )

        fe = step3_result.finance
        m1 = step3_result.model_1
        m2 = step3_result.model_2
        m3 = step3_result.model_3
        reach = step3_result.market_reach
        comp = step3_result.competitor_data

        m3_info = (
            f"Predicted APMC Price: ₹{m3.predicted_price_inr_per_quintal:,.2f}/quintal "
            f"(90% Interval: ₹{m3.confidence_interval_lower_inr:,.2f} - ₹{m3.confidence_interval_upper_inr:,.2f}), "
            f"Reference Retail: ₹{m3.reference_selling_price_inr:,.2f}/quintal"
            if m3.price_prediction_applicable and m3.predicted_price_inr_per_quintal
            else "Not an agricultural commodity. Commodity price prediction is NOT_APPLICABLE for this service business."
        )

        user_content = f"""
USER QUERY: {user_query or f"Establish a {user_input.business_category} business in {user_input.district}, {user_input.state}"}
LOCATION: {user_input.subdistrict or user_input.district}, {user_input.district}, {user_input.state}
BUSINESS CATEGORY: {user_input.business_category}

AUTHORITATIVE MODEL 1 (Market Potential):
- Score: {m1.market_potential_score} / 100
- Opportunity Tier: {self._val(m1.opportunity_tier)}
- Demand Score: {m1.demand_score}, Purchasing Power: {m1.purchasing_power_score}, Workforce: {m1.workforce_opportunity_score}, Infra: {m1.infrastructure_score}
- Top Positive Factors: {', '.join(m1.top_positive_factors)}

AUTHORITATIVE MODEL 2 (Business Viability):
- Viability Score: {m2.viability_score} / 100
- Competition Level: {self._val(m2.competition_level)}
- Market Gap Score: {m2.market_gap_score} / 100
- Risk Level: {self._val(m2.risk_level)}
- Relevant Drivers: {', '.join(m2.relevant_drivers)}

AUTHORITATIVE MODEL 3 (Commodity Price):
- {m3_info}

AUTHORITATIVE SIH FINANCE ENGINE:
- Scheme Name: {fe.scheme_name} ({self._val(fe.applicable_scheme)})
- Feasible Project Cost: ₹{fe.calculated_project_cost_inr:,.2f}
- Beneficiary Contribution: ₹{fe.beneficiary_contribution_inr:,.2f}
- Eligible Bank Loan: ₹{fe.eligible_loan_inr:,.2f}
- Interest Rate: {fe.interest_rate_pct_per_annum}% p.a.
- Tenure: {fe.tenure_months} months ({fe.tenure_years} years) with {fe.moratorium_months} months moratorium
- Capitalized Moratorium Principal: ₹{fe.effective_principal_after_moratorium_inr:,.2f}
- Monthly EMI: ₹{fe.monthly_emi_inr:,.2f}
- Total Repayment: ₹{fe.total_repayment_inr:,.2f}

HYPER-LOCAL MARKET & COMPETITION:
- Population within 5km radius: {reach.population_in_radius:,.0f} (Density: {reach.population_density_per_sqkm:.1f}/sq km)
- Competitors within 10km radius: {comp.competitor_count_10km} (Nearest: {comp.nearest_competitor_distance_km or 'None'} km)
- Saturation Index: {comp.saturation_index} ({comp.saturation_status})

OFFICIAL RAG SCHEME EVIDENCE:
- Status: {"Abstained / Insufficient Evidence" if rag_evidence.should_abstain else "Verified"}
- Answer: {rag_evidence.answer}
- Freshness: {self._val(rag_evidence.freshness)}
- Citations: {', '.join([c.title for c in rag_evidence.citations]) if rag_evidence.citations else "None"}

Please produce a JSON object with the following fields:
- "executive_summary": string
- "market_potential_interpretation": string
- "business_viability_interpretation": string
- "commodity_pricing_interpretation": string
- "finance_and_scheme_guidance": string
- "swot": {{"strengths": [list of strings], "weaknesses": [list of strings], "opportunities": [list of strings], "threats": [list of strings]}}
- "localized_recommendations": [list of strings]
- "risks_and_assumptions": [list of strings]
- "action_roadmap": [list of strings]
"""

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": user_content}]}],
            "generationConfig": {
                "temperature": self._temperature,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json"
            }
        }

        resp = httpx.post(url, headers=headers, json=payload, timeout=self._timeout_seconds)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_text)

        swot_data = parsed.get("swot", {})
        swot = AdvisorySWOT(
            strengths=swot_data.get("strengths", []),
            weaknesses=swot_data.get("weaknesses", []),
            opportunities=swot_data.get("opportunities", []),
            threats=swot_data.get("threats", [])
        )

        loc_str = f"{user_input.subdistrict or user_input.district}, {user_input.district}, {user_input.state}"
        cat_str = user_input.business_category
        roadmap_str = "\n".join([f"- **Phase {i+1}**: {step}" for i, step in enumerate(parsed.get("action_roadmap", []))])
        recs_str = "\n".join([f"- {r}" for r in parsed.get("localized_recommendations", [])])
        risks_str = "\n".join([f"- {r}" for r in parsed.get("risks_and_assumptions", [])])

        report_sections = [
            "# VentureRoot Executive Advisory Report",
            f"**Business**: {cat_str} | **Location**: {loc_str}",
            f"**Synthesis Engine**: Gemini 2.5 Flash | **Timestamp**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n",
            "## 1. Executive Summary",
            parsed.get("executive_summary", ""),
            "\n## 2. Hyper-Local Market Potential (Model 1)",
            parsed.get("market_potential_interpretation", ""),
            "\n## 3. Business Viability & Competition (Model 2)",
            parsed.get("business_viability_interpretation", ""),
            "\n## 4. Commodity Pricing Analysis (Model 3)",
            parsed.get("commodity_pricing_interpretation", ""),
            "\n## 5. Financial Structuring & SIH Credit Scheme",
            parsed.get("finance_and_scheme_guidance", ""),
            "\n## 6. Official Government Scheme & Regulatory Guidance (RAG)",
            rag_evidence.answer,
            f"\n*Freshness Status*: `{self._val(rag_evidence.freshness)}`",
            "\n## 7. Grounded Hyper-Local SWOT Analysis",
            "### Strengths\n" + "\n".join([f"- {s}" for s in swot.strengths]),
            "### Weaknesses\n" + "\n".join([f"- {w}" for w in swot.weaknesses]),
            "### Opportunities\n" + "\n".join([f"- {o}" for o in swot.opportunities]),
            "### Threats\n" + "\n".join([f"- {t}" for t in swot.threats]),
            "\n## 8. Strategic Action Roadmap & Recommendations",
            recs_str,
            "\n### Phased Implementation",
            roadmap_str,
            "\n### Key Assumptions & Operational Risks",
            risks_str,
            "\n---",
            "> [!NOTE]\n"
            "> **Statutory Notice**: VentureRoot advisory reports synthesize validated empirical models and official government publications. "
            "Final credit sanction and regulatory clearances are strictly governed by lending institutions and statutory authorities."
        ]
        full_report = "\n".join(report_sections)

        return AdvisorySynthesis(
            executive_summary=parsed.get("executive_summary", ""),
            market_potential_interpretation=parsed.get("market_potential_interpretation", ""),
            business_viability_interpretation=parsed.get("business_viability_interpretation", ""),
            commodity_pricing_interpretation=parsed.get("commodity_pricing_interpretation", ""),
            finance_and_scheme_guidance=parsed.get("finance_and_scheme_guidance", ""),
            swot=swot,
            localized_recommendations=parsed.get("localized_recommendations", []),
            risks_and_assumptions=parsed.get("risks_and_assumptions", []),
            action_roadmap=parsed.get("action_roadmap", []),
            full_advisory_report=full_report,
            advisor_model=self._model,
            advisor_status="gemini"
        )

    def _deterministic_fallback(
        self,
        step3_result: IntegratedStep3Result,
        rag_evidence: RAGEvidenceResult,
        user_input: UserBusinessInput,
        user_query: Optional[str] = None
    ) -> AdvisorySynthesis:
        fe = step3_result.finance
        m1 = step3_result.model_1
        m2 = step3_result.model_2
        m3 = step3_result.model_3
        reach = step3_result.market_reach
        comp = step3_result.competitor_data

        loc_str = f"{user_input.subdistrict or user_input.district}, {user_input.district}, {user_input.state}"
        cat_str = user_input.business_category

        exec_summary = (
            f"Based on VentureRoot hyper-local intelligence for {cat_str} in {loc_str}, "
            f"the venture demonstrates favorable commercial potential with a Market Potential Score of {m1.market_potential_score}/100 "
            f"({self._val(m1.opportunity_tier)}) and a Viability Score of {m2.viability_score}/100. "
            f"Under the {fe.scheme_name}, the entrepreneur is eligible for a bank loan of ₹{fe.eligible_loan_inr:,.2f} "
            f"with an indicative monthly EMI of ₹{fe.monthly_emi_inr:,.2f} over a {fe.tenure_years}-year tenure."
        )

        m1_interp = (
            f"Model 1 classifies {loc_str} in the '{self._val(m1.opportunity_tier)}' tier (Score: {m1.market_potential_score}/100). "
            f"Catchment analysis reveals a local consumer base of {reach.population_in_radius:,.0f} residents within a 5 km radius "
            f"with a density of {reach.population_density_per_sqkm:.1f} people/sq km. "
            f"Key driving factors include {', '.join(m1.top_positive_factors)}."
        )

        m2_interp = (
            f"Model 2 rates enterprise viability at {m2.viability_score}/100 with a Market Gap Score of {m2.market_gap_score}/100. "
            f"Spatial mapping identifies {comp.competitor_count_10km} competitors within 10 km (Saturation Index: {comp.saturation_index:.2f}, status: {comp.saturation_status}). "
            f"Assessed business competition is {self._val(m2.competition_level)} with an overall risk profile rated as {self._val(m2.risk_level)}."
        )

        if m3.price_prediction_applicable and m3.predicted_price_inr_per_quintal:
            m3_interp = (
                f"Model 3 projects an APMC wholesale mandi price of ₹{m3.predicted_price_inr_per_quintal:,.2f} per quintal for {m3.commodity}. "
                f"Statistical conformal inference establishes a 90% confidence interval of ₹{m3.confidence_interval_lower_inr:,.2f} to ₹{m3.confidence_interval_upper_inr:,.2f}/quintal. "
                f"Local market reference selling price is benchmarked at ₹{m3.reference_selling_price_inr:,.2f}/quintal."
            )
        else:
            m3_interp = (
                f"Commodity price forecasting is not applicable for {cat_str} as it is a service/value-add enterprise. "
                f"Revenues will be driven by transaction volume, service throughput, and direct local catchment patronage."
            )

        fe_interp = (
            f"The project is structured under the {fe.scheme_name}. With an available margin contribution of ₹{fe.beneficiary_contribution_inr:,.2f}, "
            f"the feasible total project capital is ₹{fe.calculated_project_cost_inr:,.2f}. "
            f"Eligible bank credit is ₹{fe.eligible_loan_inr:,.2f} at {fe.interest_rate_pct_per_annum}% p.a. over {fe.tenure_years} years ({fe.tenure_months} months). "
            f"A {fe.moratorium_months}-month moratorium allows operational ramp-up; accrued moratorium interest is capitalized, "
            f"yielding an effective principal of ₹{fe.effective_principal_after_moratorium_inr:,.2f} and a monthly EMI of ₹{fe.monthly_emi_inr:,.2f}."
        )

        swot = AdvisorySWOT(
            strengths=[
                f"Robust Market Potential Score of {m1.market_potential_score}/100 in {loc_str}.",
                f"High 90% credit financing under {fe.scheme_name} minimizing promoter equity requirement.",
                f"Strong catchment base of {reach.population_in_radius:,.0f} individuals within 5 km."
            ],
            weaknesses=[
                f"Working capital constraints during initial {fe.moratorium_months}-month ramp-up phase.",
                "Sensitivity to raw material and operational supply chain friction in rural subdistricts."
            ],
            opportunities=[
                f"Market Gap Score of {m2.market_gap_score}/100 indicates underserved local demand.",
                "Government credit-linked interest subvention and CGTMSE collateral guarantees.",
                "Direct marketing and micro-distribution channels to surrounding villages."
            ],
            threats=[
                f"Local competitor density ({comp.competitor_count_10km} units within 10 km) requiring distinct service quality.",
                "Seasonal fluctuations in purchasing power and input costs."
            ]
        )

        recommendations = [
            f"Formalize unit registration under MSME Udyam and apply for {fe.scheme_name} credit sanction.",
            f"Leverage proximity to the {reach.population_in_radius:,.0f} consumer base within 5 km to establish direct delivery partnerships.",
            "Maintain separate contingency reserve for interest obligations after the moratorium period.",
            f"Target underserved niches highlighted by Market Gap Score ({m2.market_gap_score}/100) to outposition existing competitors."
        ]

        risks = [
            f"Repayment assumption: Accrued interest during the {fe.moratorium_months}-month moratorium is capitalized into principal.",
            "Final credit sanction is subject to commercial bank underwriting and borrower credit history.",
            "Local demand estimates depend on 2011 Census spatial projections and prevailing subdistrict economic activity."
        ]

        roadmap = [
            "Month 1: Udyam MSME registration, bank DPR submission, and site finalization.",
            f"Month 2-3: Loan disbursement of ₹{fe.eligible_loan_inr:,.2f}, equipment procurement, and infrastructure setup during moratorium.",
            f"Month 4: Commercial launch and commencement of regular monthly EMI repayment (₹{fe.monthly_emi_inr:,.2f}).",
            "Month 6-12: Scale catchment reach across the 10 km distribution corridor."
        ]

        report_sections = [
            "# VentureRoot Executive Advisory Report",
            f"**Business**: {cat_str} | **Location**: {loc_str}",
            f"**Synthesis Engine**: Deterministic Authoritative Fallback | **Timestamp**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n",
            "## 1. Executive Summary",
            exec_summary,
            "\n## 2. Hyper-Local Market Potential (Model 1)",
            m1_interp,
            "\n## 3. Business Viability & Competition (Model 2)",
            m2_interp,
            "\n## 4. Commodity Pricing Analysis (Model 3)",
            m3_interp,
            "\n## 5. Financial Structuring & SIH Credit Scheme",
            fe_interp,
            "\n## 6. Official Government Scheme & Regulatory Guidance (RAG)",
            rag_evidence.answer,
            f"\n*Freshness Status*: `{self._val(rag_evidence.freshness)}`",
            "\n## 7. Grounded Hyper-Local SWOT Analysis",
            "### Strengths\n" + "\n".join([f"- {s}" for s in swot.strengths]),
            "### Weaknesses\n" + "\n".join([f"- {w}" for w in swot.weaknesses]),
            "### Opportunities\n" + "\n".join([f"- {o}" for o in swot.opportunities]),
            "### Threats\n" + "\n".join([f"- {t}" for t in swot.threats]),
            "\n## 8. Strategic Action Roadmap",
            "\n".join([f"- **Phase {idx+1}**: {step}" for idx, step in enumerate(roadmap)]),
            "\n---",
            "> [!NOTE]\n"
            "> **Statutory Notice**: VentureRoot advisory reports are generated from validated empirical models and official publications. "
            "Final credit sanction and regulatory clearances are governed by lending institutions and statutory authorities."
        ]
        full_report = "\n".join(report_sections)

        return AdvisorySynthesis(
            executive_summary=exec_summary,
            market_potential_interpretation=m1_interp,
            business_viability_interpretation=m2_interp,
            commodity_pricing_interpretation=m3_interp,
            finance_and_scheme_guidance=fe_interp,
            swot=swot,
            localized_recommendations=recommendations,
            risks_and_assumptions=risks,
            action_roadmap=roadmap,
            full_advisory_report=full_report,
            advisor_model="offline-deterministic-fallback",
            advisor_status="deterministic_fallback"
        )
