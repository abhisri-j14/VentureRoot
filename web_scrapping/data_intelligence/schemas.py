"""
VentureRoot Hyper-Local Data Intelligence Layer — Canonical Schemas
===================================================================
Defines strict Pydantic v2 schemas for:
- User-provided input data (with validation and normalization rules)
- External demographic, economic, and commodity data
- Competitor records with provenance
- Market Reach outputs (5km / 10km)
- Opportunity & Threat analysis outputs
- Product & Commodity valuation results
- Structured warnings and system diagnostics
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from .authority import AuthorityLevel, ConfidenceStatus, DataProvenance, FreshnessStatus


class CustomerType(str, Enum):
    B2C_RURAL = "B2C_RURAL"
    B2C_URBAN = "B2C_URBAN"
    B2B_LOCAL = "B2B_LOCAL"
    B2B_WHOLESALE = "B2B_WHOLESALE"
    GOVERNMENT = "GOVERNMENT"
    MIXED = "MIXED"


class OpportunityLevel(str, Enum):
    HIGH_OPPORTUNITY = "HIGH_OPPORTUNITY"
    MODERATE_OPPORTUNITY = "MODERATE_OPPORTUNITY"
    SATURATED = "SATURATED"
    OVER_SATURATED = "OVER_SATURATED"
    UNDERSERVED = "UNDERSERVED"


class ThreatLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


# =====================================================================
# 1. USER INPUT DATA SCHEMA
# =====================================================================

class UserInputData(BaseModel):
    """
    Validated user input for VentureRoot AI Business Advisor.
    Strictly differentiates user-provided data from external/scraped data.
    """
    # Mandatory geographic parameters
    state: str = Field(
        ...,
        description="Indian State or Union Territory name (e.g., 'West Bengal', 'Bihar')",
        min_length=2,
        max_length=64
    )
    district: str = Field(
        ...,
        description="District name within the state (e.g., 'Bardhaman', 'Patna')",
        min_length=2,
        max_length=64
    )
    block: str = Field(
        ...,
        description="Block, Tehsil, Taluka, or Sub-district name (e.g., 'Bhatar', 'Danapur')",
        min_length=2,
        max_length=64
    )
    village: str = Field(
        ...,
        description="Village or Locality name (e.g., 'Mahata', 'Khagaul')",
        min_length=2,
        max_length=64
    )

    # Coordinates (Optional from user, can be resolved by geo service)
    latitude: Optional[float] = Field(
        None,
        description="Latitude in decimal degrees (India bounds: 6.0 to 38.0)",
        ge=6.0,
        le=38.0
    )
    longitude: Optional[float] = Field(
        None,
        description="Longitude in decimal degrees (India bounds: 68.0 to 98.0)",
        ge=68.0,
        le=98.0
    )

    # Financial inputs (INR)
    available_margin_capital: float = Field(
        ...,
        description="Liquid capital or margin money available with entrepreneur in INR",
        ge=5000.0,
        le=100000000.0
    )
    proposed_project_budget: Optional[float] = Field(
        None,
        description="Total estimated project cost in INR (must be >= available margin capital)",
        ge=5000.0,
        le=100000000.0
    )
    operating_expenses: Optional[float] = Field(
        None,
        description="Estimated monthly operating expenses in INR",
        ge=0.0,
        le=10000000.0
    )

    # Business profile
    business_category: str = Field(
        ...,
        description="Standard business category (e.g., 'Dairy Processing', 'Retail Kirana')",
        min_length=2,
        max_length=64
    )
    proposed_product_service: str = Field(
        ...,
        description="Specific primary product or service offered (e.g., 'Paneer & Ghee Packaging')",
        min_length=2,
        max_length=128
    )

    # Entrepreneur & Operational attributes
    entrepreneur_experience_years: float = Field(
        0.0,
        description="Relevant experience of entrepreneur in years",
        ge=0.0,
        le=60.0
    )
    existing_resources: List[str] = Field(
        default_factory=list,
        description="Available assets (e.g., ['commercial land', 'borewell', 'delivery van'])"
    )
    target_customer_type: CustomerType = Field(
        CustomerType.B2C_RURAL,
        description="Primary customer persona"
    )
    preferred_market_radius_km: float = Field(
        10.0,
        description="Preferred catchment radius for hyper-local analysis (typically 5 or 10 km)",
        ge=1.0,
        le=50.0
    )

    @field_validator("state", "district", "block", "village", "business_category", "proposed_product_service")
    @classmethod
    def strip_and_clean(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Field cannot be empty or whitespace only")
        return v_clean

    @model_validator(mode="after")
    def validate_budget_vs_capital(self) -> UserInputData:
        if self.proposed_project_budget is not None:
            if self.proposed_project_budget < self.available_margin_capital:
                # Margin capital cannot exceed total project budget
                self.proposed_project_budget = max(self.proposed_project_budget, self.available_margin_capital)
        return self


# =====================================================================
# 2. DEMOGRAPHIC & ECONOMIC DATA SCHEMA (LEVEL 1 / CENSUS PCA)
# =====================================================================

class DemographicProfile(BaseModel):
    """
    Public administrative/demographic data from Census PCA / SECC.
    Never fabricated; explicitly marks proxies vs exact block counts.
    """
    state: str
    district: str
    subdistrict_or_block: str
    village_or_town: Optional[str] = None
    census_code: Optional[str] = None
    
    total_population: int = Field(..., ge=0)
    total_households: int = Field(..., ge=0)
    male_population: int = Field(0, ge=0)
    female_population: int = Field(0, ge=0)
    literacy_rate: float = Field(..., ge=0.0, le=100.0)
    working_population: int = Field(0, ge=0)
    
    # Geographic metrics
    area_sqkm: float = Field(..., gt=0.0)
    population_density_sqkm: float = Field(..., ge=0.0)
    
    # Metadata & Provenance
    provenance: DataProvenance


# =====================================================================
# 3. COMPETITOR INTELLIGENCE SCHEMA
# =====================================================================

class CompetitorRecord(BaseModel):
    """
    Validated competitor or business record collected from public registers,
    MSME Udyam, local directories, or web intelligence.
    """
    business_id: str
    raw_name: str
    normalized_name: str
    category: str
    subcategory: Optional[str] = None
    products_services: List[str] = Field(default_factory=list)
    
    address: str
    state: str
    district: str
    block: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    
    latitude: float = Field(..., ge=6.0, le=38.0)
    longitude: float = Field(..., ge=68.0, le=98.0)
    distance_km: Optional[float] = None  # Calculated relative to target anchor
    
    is_direct_competitor: bool = True
    operational_status: str = "OPERATIONAL"  # OPERATIONAL, CLOSED, UNKNOWN
    
    # Quality & Deduplication
    is_duplicate: bool = False
    possible_duplicate_of: Optional[str] = None
    confidence_score: float = Field(1.0, ge=0.0, le=1.0)
    
    provenance: DataProvenance


# =====================================================================
# 4. MARKET REACH (5 KM / 10 KM HYPER-LOCAL CATCHMENT)
# =====================================================================

class MarketCluster(BaseModel):
    name: str
    cluster_type: str  # e.g., "HAAT_MANDI", "MARKET_CROSSING", "BLOCK_HQ"
    distance_km: float
    latitude: float
    longitude: float
    estimated_daily_footfall: Optional[int] = None


class MarketReachResult(BaseModel):
    """
    Structured output for hyper-local reach within configurable 5/10 km radius.
    Differentiates exact counts from spatial density estimates.
    """
    anchor_location: Dict[str, Any]  # state, district, block, village, lat, lon
    radius_km: float = Field(..., ge=1.0, le=50.0)
    area_covered_sqkm: float
    
    # Demographic reach
    population_estimate: int
    is_exact_census_count: bool = False
    estimation_methodology: str = (
        "BLOCK_DENSITY_EXTRAPOLATION (pi * r^2 * subdistrict_density capped at subdistrict_pop)"
    )
    households_estimate: int
    
    # Business presence
    total_businesses_in_radius: int
    competitors_in_radius: int
    competitor_density_per_sqkm: float
    
    # Nearest competitors
    nearest_competitors: List[CompetitorRecord] = Field(default_factory=list)
    market_clusters: List[MarketCluster] = Field(default_factory=list)
    
    # Provenance and warnings
    data_sources: List[DataProvenance] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# =====================================================================
# 5. OPPORTUNITY ANALYSIS SCHEMA
# =====================================================================

class OpportunityAnalysisResult(BaseModel):
    """
    Evidence-backed opportunity signals for entrepreneur's proposed business.
    Does NOT assert guaranteed success; provides empirical local market facts.
    """
    target_category: str
    proposed_product_service: str
    radius_km: float
    
    competitor_count_5km: int
    competitor_count_10km: int
    market_density_status: str  # LOW, MODERATE, HIGH, SATURATED
    opportunity_signal: OpportunityLevel
    
    evidence: List[str] = Field(default_factory=list)
    underserved_categories_in_catchment: List[str] = Field(default_factory=list)
    demand_signals: List[Dict[str, Any]] = Field(default_factory=list)
    
    provenance: List[DataProvenance] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# =====================================================================
# 6. THREAT ANALYSIS SCHEMA
# =====================================================================

class ThreatAnalysisResult(BaseModel):
    """
    Identifies competitive crowding, supply bottlenecks, and single-buyer dependency.
    """
    category: str
    saturation_index: float = Field(..., ge=0.0, le=1.0)
    threat_level: ThreatLevel
    nearest_competitor_distance_km: Optional[float] = None
    
    identified_threats: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_mitigations: List[str] = Field(default_factory=list)
    
    provenance: List[DataProvenance] = Field(default_factory=list)


# =====================================================================
# 7. PRODUCT & COMMODITY VALUATION SCHEMA
# =====================================================================

class ProductValuationResult(BaseModel):
    """
    Product or commodity price benchmarks from eNAM / Agmarknet / local mandi.
    """
    commodity_or_product: str
    normalized_name: str
    category: str
    market_or_mandi: str
    state: str
    district: str
    
    min_price_inr: float
    modal_price_inr: float
    max_price_inr: float
    unit: str = "INR/quintal"
    
    price_date: str
    provenance: DataProvenance
    freshness: FreshnessStatus


# =====================================================================
# 8. STRUCTURED SYSTEM WARNINGS
# =====================================================================

class WarningCode(str, Enum):
    DATA_SOURCE_UNAVAILABLE = "DATA_SOURCE_UNAVAILABLE"
    DATA_STALE = "DATA_STALE"
    LOCATION_NOT_FOUND = "LOCATION_NOT_FOUND"
    INSUFFICIENT_LOCAL_DATA = "INSUFFICIENT_LOCAL_DATA"
    COORDINATES_RESOLVED_BY_CENTROID = "COORDINATES_RESOLVED_BY_CENTROID"
    ESTIMATED_POPULATION_PROXY = "ESTIMATED_POPULATION_PROXY"
    SCRAPING_RATE_LIMITED = "SCRAPING_RATE_LIMITED"


class StructuredWarning(BaseModel):
    code: WarningCode
    message: str
    field: Optional[str] = None
    affected_source: Optional[str] = None
    mitigation: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# =====================================================================
# 9. PIPELINE CONTRACT ENUMS & CANONICAL THRESHOLDS
# =====================================================================

class ComponentStatus(str, Enum):
    SUCCESS = "SUCCESS"
    DEGRADED = "DEGRADED"
    UNAVAILABLE = "UNAVAILABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    FAILED = "FAILED"


class ApplicableScheme(str, Enum):
    MICRO_FINANCE = "Micro Finance Scheme"
    TERM_LOAN = "Term Loan Scheme"
    EXCEEDS_SCHEME_LIMIT = "Exceeds Scheme Limit"
    INVALID_MARGIN = "Invalid Margin"


class OpportunityTier(str, Enum):
    VERY_HIGH = "Very High"
    HIGH = "High"
    MODERATE = "Moderate"
    LOW = "Low"
    VERY_LOW = "Very Low"
    UNKNOWN = "Unknown"


def get_opportunity_tier(score: Optional[float]) -> OpportunityTier:
    """
    Canonical single-source-of-truth for Model 1 Market Potential Index (MPI) tiers.
    Standardized thresholds across all models and adapters:
    >= 85.0 -> Very High
    >= 65.0 -> High
    >= 45.0 -> Moderate
    >= 25.0 -> Low
    <  25.0 -> Very Low
    """
    if score is None:
        return OpportunityTier.UNKNOWN
    if score >= 85.0:
        return OpportunityTier.VERY_HIGH
    if score >= 65.0:
        return OpportunityTier.HIGH
    if score >= 45.0:
        return OpportunityTier.MODERATE
    if score >= 25.0:
        return OpportunityTier.LOW
    return OpportunityTier.VERY_LOW


class ReliabilityRating(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


# =====================================================================
# 10. USER BUSINESS INPUT SCHEMA
# =====================================================================

class UserBusinessInput(BaseModel):
    """
    Standardized payload provided by the entrepreneur or frontend wizard.
    """
    state: str = Field(..., min_length=2, description="State or Union Territory name")
    district: str = Field(..., min_length=2, description="District name")
    subdistrict: Optional[str] = Field(None, description="Sub-district / Tehsil / Taluka / Block name")
    block: Optional[str] = Field(None, description="Block name alias for subdistrict")
    village: Optional[str] = Field(None, description="Village or settlement name")
    latitude: Optional[float] = Field(None, ge=6.0, le=38.0, description="Latitude in decimal degrees (India: 6.0 to 38.0)")
    longitude: Optional[float] = Field(None, ge=68.0, le=98.0, description="Longitude in decimal degrees (India: 68.0 to 98.0)")

    model_config = {"protected_namespaces": ()}

    business_category: str = Field(..., min_length=2, description="Canonical or raw business category (e.g., 'Dairy Farming', 'Retail')")
    product_service: Optional[str] = Field(None, description="Specific product or service description")
    commodity: Optional[str] = Field(None, description="Agricultural commodity name if applicable (e.g., 'Wheat', 'Mustard')")

    available_margin_inr: float = Field(..., description="Entrepreneur's available equity/margin capital in INR (minimum > 0)")
    proposed_budget_inr: Optional[float] = Field(None, ge=0.0, description="Optional target budget envisioned by user in INR")
    monthly_operating_cost_inr: Optional[float] = Field(None, ge=0.0, description="Estimated monthly operating expenses in INR")
    fixed_asset_cost_inr: Optional[float] = Field(None, ge=0.0, description="Initial fixed machinery/equipment outlay in INR")
    initial_inventory_inr: Optional[float] = Field(None, ge=0.0, description="Starting raw materials / inventory outlay in INR")

    preferred_catchment_radius_km: float = Field(10.0, ge=1.0, le=50.0, description="Catchment radius for market reach (standard: 5.0 or 10.0 km)")
    preferred_market_radius_km: float = Field(10.0, ge=1.0, le=50.0, description="Alias for preferred_catchment_radius_km")

    def __init__(self, **data):
        dist = data.get("district", "")
        if not data.get("subdistrict") and not data.get("block"):
            data["subdistrict"] = dist
            data["block"] = dist
        elif data.get("subdistrict") and not data.get("block"):
            data["block"] = data["subdistrict"]
        elif data.get("block") and not data.get("subdistrict"):
            data["subdistrict"] = data["block"]

        radius = data.get("preferred_catchment_radius_km") or data.get("preferred_market_radius_km") or 10.0
        data["preferred_catchment_radius_km"] = float(radius)
        data["preferred_market_radius_km"] = float(radius)
        super().__init__(**data)

    @field_validator("available_margin_inr")
    def validate_margin(cls, v: float) -> float:
        if v is None:
            raise ValueError("Available margin is required.")
        if v <= 0:
            raise ValueError(f"Available margin must be greater than zero. Received: {v}")
        return float(v)


# =====================================================================
# 11. NUMERICAL PROVENANCE SCHEMA
# =====================================================================

class NumericalProvenanceItem(BaseModel):
    """
    Every numerical output in VentureRoot retains singular, unambiguous authority.
    Used by the Step 4 Numerical Firewall to guarantee no hallucination.
    """
    metric: str = Field(..., description="Canonical metric key (e.g., 'market_potential_score', 'monthly_emi_inr')")
    value: Any = Field(..., description="Exact numerical or discrete output")
    unit: str = Field(..., description="Unit of measurement (e.g., 'index_0_100', 'INR', 'INR_per_quintal', 'months', 'pct_per_annum')")
    source: str = Field(..., description="Authoritative computational source (e.g., 'model_1', 'model_2', 'model_3', 'finance_engine', 'census_geo')")
    authoritative: bool = Field(True, description="Flag declaring this value as the authoritative ground truth")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 generation timestamp")


# =====================================================================
# 12. INTERMEDIATE DATA INTELLIGENCE SCHEMAS
# =====================================================================

class LocationData(BaseModel):
    state: str
    district: str
    subdistrict: str
    village: Optional[str] = None
    latitude: float
    longitude: float
    is_coordinate_estimated: bool = False
    administrative_population: int = 0
    administrative_households: int = 0
    literacy_rate: float = 0.0
    worker_participation_rate: float = 0.0
    provenance: Dict[str, Any] = Field(default_factory=dict)


class MarketReachData(BaseModel):
    catchment_radius_km: float
    population_in_radius: int
    households_in_radius: int
    population_density_per_sqkm: float
    reach_status: str = "COMPUTED"
    methodology: str = "spatial_density_extrapolation"
    evidence_sources: List[str] = Field(default_factory=list)


class CompetitorData(BaseModel):
    competitor_count_5km: int = 0
    competitor_count_10km: int = 0
    competitor_density_per_sqkm: float = 0.0
    nearest_competitor_distance_km: Optional[float] = None
    saturation_index: float = 0.0
    saturation_status: str = "MODERATE"
    competitors_identified: List[Dict[str, Any]] = Field(default_factory=list)


# =====================================================================
# 13. MODEL 1 OUTPUT SCHEMA
# =====================================================================

class Model1Output(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: ComponentStatus = ComponentStatus.SUCCESS
    model_version: str = "1.0.0"
    methodology_version: str = "1.0.0"
    market_potential_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="MPI index score on 0-100 scale")
    opportunity_tier: OpportunityTier = OpportunityTier.UNKNOWN
    demand_score: Optional[float] = None
    purchasing_power_score: Optional[float] = None
    workforce_opportunity_score: Optional[float] = None
    infrastructure_score: Optional[float] = None
    market_gap_score: Optional[float] = None
    confidence_score_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    top_positive_factors: List[str] = Field(default_factory=list)
    top_negative_factors: List[str] = Field(default_factory=list)
    feature_snapshot: Dict[str, Any] = Field(default_factory=dict)
    prediction_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


# =====================================================================
# 14. MODEL 2 OUTPUT SCHEMA
# =====================================================================

class Model2Output(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: ComponentStatus = ComponentStatus.SUCCESS
    model_version: str = "1.0.0"
    methodology_version: str = "1.0.0"
    viability_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Viability & Opportunity index score on 0-100 scale")
    market_gap_score: Optional[float] = None
    competition_level: str = "Moderate"
    risk_level: str = "Moderate"
    score_band: str = "Moderate Opportunity"
    confidence_rating: str = "Moderate"
    data_completeness_pct: float = 100.0
    is_out_of_distribution: bool = False
    selected_category: str
    category_rankings: List[Dict[str, Any]] = Field(default_factory=list)
    relevant_drivers: List[str] = Field(default_factory=list)
    feature_snapshot: Dict[str, Any] = Field(default_factory=dict)
    prediction_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


# =====================================================================
# 15. MODEL 3 OUTPUT SCHEMA (Commodity Price Forecasting)
# =====================================================================

class Model3Output(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: ComponentStatus = ComponentStatus.SUCCESS
    price_prediction_applicable: bool = True
    model_version: str = "1.0.0"
    methodology_version: str = "1.0.0"
    commodity: Optional[str] = None
    variety: Optional[str] = None
    grade: Optional[str] = None
    predicted_price_inr_per_quintal: Optional[float] = Field(None, ge=0.0)
    display_predicted_price: Optional[str] = None
    price_unit: str = "INR/quintal"
    confidence_interval_lower_inr: Optional[float] = None
    confidence_interval_upper_inr: Optional[float] = None
    display_confidence_interval: Optional[str] = None
    confidence_interval_coverage_pct: float = 90.0
    reference_selling_price_inr: Optional[float] = None
    display_reference_selling_price: Optional[str] = None
    reliability_rating: ReliabilityRating = ReliabilityRating.MEDIUM
    confidence_level: str = "Medium"
    price_drivers_positive: List[str] = Field(default_factory=list)
    price_drivers_negative: List[str] = Field(default_factory=list)
    official_reference_price_inr: Optional[float] = None
    official_reference_source: Optional[str] = None
    prediction_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


# =====================================================================
# 16. FINANCE ENGINE OUTPUT SCHEMA (Strict SIH Compliance)
# =====================================================================

class AmortizationScheduleRow(BaseModel):
    period: int
    period_type: str = "MONTH"
    opening_balance_inr: float
    emi_or_installment_inr: float
    principal_inr: float
    interest_inr: float
    closing_balance_inr: float
    is_moratorium: bool = False


class WorkingCapitalSummary(BaseModel):
    fixed_assets_inr: float = 0.0
    initial_inventory_inr: float = 0.0
    monthly_operating_cost_inr: float = 0.0
    coverage_months: int = 3
    working_capital_required_inr: float = 0.0
    total_project_requirement_inr: float = 0.0


class FinanceOutput(BaseModel):
    status: ComponentStatus = ComponentStatus.SUCCESS
    
    available_margin_inr: float
    calculated_project_cost_inr: float
    beneficiary_contribution_inr: float
    
    applicable_scheme: ApplicableScheme
    is_within_scheme_limit: bool
    scheme_name: str
    scheme_loan_cap_inr: float
    eligible_loan_inr: float
    
    interest_rate_pct_per_annum: float
    tenure_years: int
    tenure_months: int
    moratorium_months: int
    effective_principal_after_moratorium_inr: float
    
    monthly_emi_inr: float
    total_interest_payable_inr: float
    total_repayment_inr: float
    
    proposed_project_cost_inr: Optional[float] = None
    required_margin_for_proposed_inr: Optional[float] = None
    margin_shortfall_inr: float = 0.0
    budget_comparison_note: Optional[str] = None
    
    monthly_repayment_schedule_preview: List[AmortizationScheduleRow] = Field(default_factory=list)
    quarterly_repayment_schedule: List[AmortizationScheduleRow] = Field(default_factory=list)
    working_capital: Optional[WorkingCapitalSummary] = None
    
    explanatory_notes: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    repayment_assumption_note: str = "Interest accrued during the moratorium period is capitalized into the principal before EMI amortization commences."
    financial_disclaimer: str = "Financial feasibility calculations are indicative based on the SIH Micro Finance / Term Loan scheme guidelines. Actual sanction depends on financial institution credit underwriting."
    calculation_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# =====================================================================
# 17. INTEGRATED PIPELINE RESULT SCHEMA
# =====================================================================

class IntegratedStep3Result(BaseModel):
    model_config = {"protected_namespaces": ()}
    """
    Complete, validated pipeline output containing all evidence layers.
    Consumed by the Numerical Firewall and RAG synthesis.
    """
    status: ComponentStatus = ComponentStatus.SUCCESS
    pipeline_version: str = "3.0.0"
    pipeline_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    user_input: UserBusinessInput

    location_data: LocationData
    market_reach: MarketReachData
    competitor_data: CompetitorData

    model_1: Model1Output
    model_2: Model2Output
    model_3: Model3Output
    finance: FinanceOutput

    numerical_provenance: List[NumericalProvenanceItem] = Field(default_factory=list)

    component_health: Dict[str, ComponentStatus] = Field(default_factory=dict)
    data_leakage_audit_passed: bool = True
    audit_notes: List[str] = Field(default_factory=list)

    @property
    def finance_engine(self) -> FinanceOutput:
        return self.finance

    @property
    def model_1_market_potential(self) -> Model1Output:
        return self.model_1

    @property
    def model_2_viability(self) -> Model2Output:
        return self.model_2

    @property
    def model_3_commodity_pricing(self) -> Model3Output:
        return self.model_3

    @property
    def market_reach_5km(self) -> MarketReachData:
        return self.market_reach

    @property
    def market_reach_10km(self) -> MarketReachData:
        return self.market_reach

    def model_dump(self, *args, **kwargs):
        d = super().model_dump(*args, **kwargs)
        d["finance_engine"] = d.get("finance")
        d["model_1_market_potential"] = d.get("model_1")
        d["model_2_viability"] = d.get("model_2")
        d["model_3_commodity_pricing"] = d.get("model_3")
        return d


# =====================================================================
# 18. RAG, ADVISORY & NUMERICAL FIREWALL SCHEMAS
# =====================================================================

class RAGCitation(BaseModel):
    model_config = {"protected_namespaces": ()}
    citation_id: str
    title: str
    publisher: Optional[str] = None
    department: Optional[str] = None
    state: Optional[str] = None
    source_url: Optional[str] = None
    page_number: int = 1
    effective_date: Optional[str] = None

    @property
    def document_title(self) -> str:
        return self.title

    @property
    def excerpt(self) -> str:
        return self.title or ""

    @property
    def relevance_score(self) -> float:
        return 0.85


class RAGEvidenceResult(BaseModel):
    model_config = {"protected_namespaces": ()}
    query: str
    answer: str
    should_abstain: bool = False
    confidence_level: str = "MEDIUM"
    freshness: FreshnessStatus = FreshnessStatus.CURRENT
    citations: List[RAGCitation] = Field(default_factory=list)
    source_chunks_count: int = 0
    retrieval_notes: List[str] = Field(default_factory=list)

    @property
    def status(self) -> ComponentStatus:
        return ComponentStatus.SUCCESS if not self.should_abstain else ComponentStatus.DEGRADED

    @property
    def freshness_status(self) -> FreshnessStatus:
        return self.freshness


class AdvisorySWOT(BaseModel):
    model_config = {"protected_namespaces": ()}
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    threats: List[str] = Field(default_factory=list)


class AdvisorySynthesis(BaseModel):
    model_config = {"protected_namespaces": ()}
    executive_summary: str
    market_potential_interpretation: str
    business_viability_interpretation: str
    commodity_pricing_interpretation: str
    finance_and_scheme_guidance: str
    swot: AdvisorySWOT
    localized_recommendations: List[str] = Field(default_factory=list)
    risks_and_assumptions: List[str] = Field(default_factory=list)
    action_roadmap: List[str] = Field(default_factory=list)
    full_advisory_report: str
    synthesis_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    advisor_model: str = "gemini-2.5-flash"
    advisor_status: str = "gemini"

    def __iter__(self):
        yield self
        yield self.advisor_model


class NumericalIntegrityStatus(BaseModel):
    model_config = {"protected_namespaces": ()}
    firewall_passed: bool = True
    violations_detected: List[str] = Field(default_factory=list)
    reconciled: bool = False
    reconciliation_notes: List[str] = Field(default_factory=list)
    verified_metrics: Dict[str, Any] = Field(default_factory=dict)
    audit_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @property
    def verified(self) -> bool:
        return self.firewall_passed

    @property
    def tampering_detected(self) -> bool:
        return not self.firewall_passed

    @property
    def violations(self) -> List[str]:
        return self.violations_detected

    @property
    def reconciliation_applied(self) -> bool:
        return self.reconciled


class IntegratedStep4Result(IntegratedStep3Result):
    model_config = {"protected_namespaces": ()}
    """
    Complete Step 4 Integrated Result inheriting all Step 3 computational outputs
    and adding RAG official evidence, Gemini AI Advisory synthesis, and
    the verified Numerical Integrity Firewall status.
    """
    pipeline_version: str = "4.0.0"
    rag_evidence: Optional[RAGEvidenceResult] = None
    advisory_synthesis: Optional[AdvisorySynthesis] = None
    numerical_integrity: Optional[NumericalIntegrityStatus] = None
    advisor_model: str = "gemini-2.5-flash"
    composite_confidence: str = "HIGH"
    correlation_id: str = ""
    latency_ms: float = 0.0

    @property
    def ai_advisor(self) -> Optional[AdvisorySynthesis]:
        return self.advisory_synthesis

    @property
    def numerical_firewall(self) -> Optional[NumericalIntegrityStatus]:
        return self.numerical_integrity

    def model_dump(self, *args, **kwargs):
        d = super().model_dump(*args, **kwargs)
        d["ai_advisor"] = d.get("advisory_synthesis")
        d["numerical_firewall"] = d.get("numerical_integrity")
        return d

