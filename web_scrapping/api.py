"""
VentureRoot Hyper-Local Data & Knowledge Graph Microservice
===========================================================
FastAPI microservice providing:
- End-to-end hyper-local business intelligence pipeline
- Market Reach analysis within 5 km & 10 km (spatial density math)
- Competitor mapping, non-destructive deduplication, and saturation
- Opportunity & Threat empirical signals
- Commodity & product valuation (Agmarknet / eNAM)
- Knowledge Graph spatial & semantic queries
- Backward-compatible endpoints for census tables & legacy location stats
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from data_intelligence import (
    CompetitorIntelligenceEngine,
    DataProvenance,
    HyperLocalOrchestrator,
    OpportunityAnalysisEngine,
    ProductValuationEngine,
    ThreatAnalysisEngine,
    UserInputData,
    clean_text_string,
    estimate_population_in_radius,
    haversine_distance,
    normalize_business_category,
    normalize_commodity_name,
    normalize_state_name,
    validate_and_normalize_coordinates
)
from data_intelligence.pipeline import VentureRootPipeline, VentureRootStep3Pipeline
from data_intelligence.schemas import UserBusinessInput, IntegratedStep3Result, IntegratedStep4Result

app = FastAPI(
    title="VentureRoot Hyper-Local Intelligence API",
    description="Data intelligence layer for VentureRoot AI Business Advisor (SIH)",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Orchestrator and Unified Pipeline Singletons
orchestrator = HyperLocalOrchestrator()
step3_pipeline = VentureRootPipeline(orchestrator=orchestrator)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "census_data_files"
POPULATION_FILE = DATA_DIR / "state_population.xlsx"
HOUSING_FILE = DATA_DIR / "national_housing.xls"


def load_population_df() -> pd.DataFrame:
    if not POPULATION_FILE.exists():
        raise FileNotFoundError(f"Population dataset missing at {POPULATION_FILE}")
    df = pd.read_excel(
        POPULATION_FILE,
        skiprows=7,
        header=None,
        usecols=[7, 8, 9, 10, 11, 12],
        names=["state", "area_type", "households", "total_population", "male_population", "female_population"]
    )
    df = df.dropna(subset=["state"])
    df["state"] = df["state"].astype(str).str.strip()
    return df


def load_housing_df() -> pd.DataFrame:
    if not HOUSING_FILE.exists():
        raise FileNotFoundError(f"Housing dataset missing at {HOUSING_FILE}")
    df = pd.read_excel(
        HOUSING_FILE,
        skiprows=7,
        header=None,
        usecols=[5, 6, 7, 8, 9, 10, 12],
        names=["state", "area_type", "total_houses", "vacant_houses", "occupied_houses", "residence", "shop_office"]
    )
    df = df.dropna(subset=["state"])
    df["state"] = df["state"].astype(str).str.replace("STATE - ", "", regex=False).str.strip()
    return df


# =====================================================================
# SYSTEM HEALTH & METADATA
# =====================================================================

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "VentureRoot Hyper-Local Data & Knowledge Graph Microservice",
        "version": "4.0.0",
        "kg_nodes": len(orchestrator.kg.nodes),
        "kg_edges": sum(len(e) for e in orchestrator.kg.out_edges.values()),
        "indexed_subdistricts": len(orchestrator.demographics_index)
    }


# =====================================================================
# STEP 4 & STEP 3 MASTER INTEGRATION ENDPOINTS
# =====================================================================

@app.post("/api/v1/analyze-business")
@app.post("/api/v1/step4/analyze")
def analyze_business_step4(user_input: UserBusinessInput):
    """
    Executes the comprehensive Step 4 integration pipeline:
    - Step 3 Models (M1 Market Potential, M2 Viability, M3 Pricing, Finance Engine)
    - Grounded RAG Retrieval (Scheme guidelines, APMC, state MSME policies)
    - Gemini 2.5 Flash Advisory Synthesis (SWOT, Recommendations, Roadmap)
    - Step 4 Numerical Firewall (zero tampering enforcement)
    """
    try:
        result = step3_pipeline.execute_step4(user_input)
        return {"status": "SUCCESS", "data": result.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Step 4 analysis failed: {str(e)}")


@app.post("/api/v1/step3/analyze")
def analyze_business_step3(user_input: UserBusinessInput):
    """
    Executes the Step 3 computational pipeline without LLM advisory synthesis.
    """
    try:
        result = step3_pipeline.execute(user_input)
        return {"status": "SUCCESS", "data": result.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Step 3 analysis failed: {str(e)}")


@app.get("/api/v1/step3/health")
def step3_health_check():
    """
    Checks the status and availability of all Step 3 computational components.
    """
    return {
        "status": "HEALTHY",
        "pipeline_version": "3.0.0",
        "components": {
            "model_1": "ONLINE" if step3_pipeline.model_1_adapter._predictor is not None else "DEGRADED",
            "model_2": "ONLINE" if step3_pipeline.model_2_adapter._engine is not None else "DEGRADED",
            "model_3": "ONLINE" if step3_pipeline.model_3_adapter._engine is not None else "DEGRADED",
            "finance_engine": "ONLINE",
            "knowledge_graph": "ONLINE" if len(orchestrator.kg.nodes) > 0 else "DEGRADED"
        }
    }


@app.get("/api/v1/step4/health")
def step4_health_check():
    """
    Checks the status and availability of all Step 4 computational, RAG, and AI components.
    """
    gemini_status = "ONLINE" if step3_pipeline.gemini_client.api_key else "DEGRADED (OFFLINE_FALLBACK)"
    rag_status = "ONLINE" if step3_pipeline.rag_adapter._pipeline is not None else "DEGRADED"
    return {
        "status": "HEALTHY",
        "pipeline_version": "4.0.0",
        "components": {
            "model_1": "ONLINE" if step3_pipeline.model_1_adapter._predictor is not None else "DEGRADED",
            "model_2": "ONLINE" if step3_pipeline.model_2_adapter._engine is not None else "DEGRADED",
            "model_3": "ONLINE" if step3_pipeline.model_3_adapter._engine is not None else "DEGRADED",
            "finance_engine": "ONLINE",
            "knowledge_graph": "ONLINE" if len(orchestrator.kg.nodes) > 0 else "DEGRADED",
            "rag_engine": rag_status,
            "gemini_advisor": gemini_status,
            "numerical_firewall": "ONLINE"
        }
    }


@app.post("/api/v1/rag/query")
def query_rag_endpoint(payload: Dict[str, Any]):
    """
    Direct RAG endpoint for official SIH government schemes and regulatory evidence retrieval.
    """
    query = str(payload.get("query", "")).strip()
    if not query:
        raise HTTPException(status_code=422, detail="Field 'query' cannot be empty.")
    top_k = int(payload.get("top_k", 3))
    category = payload.get("category")
    state = payload.get("state")
    rag_res = step3_pipeline.rag_adapter.query(query_text=query, category=category, state=state, top_k=top_k)
    return {"status": "SUCCESS", "data": rag_res.model_dump()}


# =====================================================================
# 1. NORMALIZATION ENDPOINT
# =====================================================================

@app.post("/api/v1/data/normalize")
def normalize_fields(payload: Dict[str, Any]):
    """
    Normalizes arbitrary geographic, commercial, commodity, or coordinate inputs.
    """
    results: Dict[str, Any] = {}

    if "state" in payload:
        results["state"] = {
            "original": payload["state"],
            "normalized": normalize_state_name(payload["state"])
        }

    if "category" in payload:
        results["category"] = {
            "original": payload["category"],
            "normalized": normalize_business_category(payload["category"])
        }

    if "commodity" in payload:
        results["commodity"] = {
            "original": payload["commodity"],
            "normalized": normalize_commodity_name(payload["commodity"])
        }

    if "coordinates" in payload and isinstance(payload["coordinates"], (list, tuple)):
        lat, lon = payload["coordinates"]
        is_valid, norm_coords, err = validate_and_normalize_coordinates(lat, lon)
        results["coordinates"] = {
            "is_valid": is_valid,
            "normalized": norm_coords,
            "error": err
        }

    return {"status": "SUCCESS", "results": results}


# =====================================================================
# 2. HYPER-LOCAL MARKET REACH (5 KM / 10 KM)
# =====================================================================

@app.post("/api/v1/data/reach")
def get_market_reach(user_input: UserInputData):
    """
    Computes spatial market reach within preferred catchment radius (e.g. 5km or 10km).
    Uses block-level density extrapolation instead of arbitrary state percentage proxies.
    """
    try:
        demo_profile, _ = orchestrator.resolve_demographics(user_input.state, user_input.district, user_input.block)
        anchor_lat, anchor_lon, _ = orchestrator.resolve_anchor_coordinates(user_input, demo_profile)
        reach_result = orchestrator.execute_market_reach(user_input, anchor_lat, anchor_lon, demo_profile)
        return {"status": "SUCCESS", "data": reach_result.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market reach calculation failed: {str(e)}")


# =====================================================================
# 3. COMPETITOR INTELLIGENCE
# =====================================================================

@app.post("/api/v1/data/competitors")
def get_competitors(
    latitude: float = Query(..., ge=6.0, le=38.0),
    longitude: float = Query(..., ge=68.0, le=98.0),
    category: str = Query(..., min_length=2),
    radius_km: float = Query(10.0, ge=1.0, le=50.0)
):
    """
    Retrieves direct competitors within catchment, nearest competitor distances,
    and saturation metrics from the Knowledge Graph.
    """
    norm_cat = normalize_business_category(category)
    result = orchestrator.kg.query_competitors_within_radius(
        center_lat=latitude,
        center_lon=longitude,
        category=norm_cat,
        radius_km=radius_km
    )
    sat_index, sat_status = CompetitorIntelligenceEngine.compute_local_saturation(
        competitor_count=result["competitor_count_radius"],
        radius_km=radius_km
    )
    result["saturation_index"] = sat_index
    result["saturation_status"] = sat_status
    return {"status": "SUCCESS", "data": result}


# =====================================================================
# 4. OPPORTUNITY & THREAT ENGINES
# =====================================================================

@app.post("/api/v1/data/opportunity")
def get_opportunity_analysis(user_input: UserInputData):
    """
    Returns empirical competition counts, underserved categories, and local demand signals.
    """
    try:
        demo_profile, _ = orchestrator.resolve_demographics(user_input.state, user_input.district, user_input.block)
        anchor_lat, anchor_lon, _ = orchestrator.resolve_anchor_coordinates(user_input, demo_profile)
        reach = orchestrator.execute_market_reach(user_input, anchor_lat, anchor_lon, demo_profile)

        opp = OpportunityAnalysisEngine.evaluate_opportunity(
            kg=orchestrator.kg,
            center_lat=anchor_lat,
            center_lon=anchor_lon,
            target_category=user_input.business_category,
            proposed_product_service=user_input.proposed_product_service,
            radius_km=user_input.preferred_market_radius_km,
            demographic_pop_estimate=reach.population_estimate
        )
        return {"status": "SUCCESS", "data": opp.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/data/threats")
def get_threat_analysis(user_input: UserInputData):
    """
    Identifies micro-market threats (hyper-proximity, oversaturation, perishable bottlenecks).
    """
    try:
        demo_profile, _ = orchestrator.resolve_demographics(user_input.state, user_input.district, user_input.block)
        anchor_lat, anchor_lon, _ = orchestrator.resolve_anchor_coordinates(user_input, demo_profile)

        threats = ThreatAnalysisEngine.evaluate_threats(
            kg=orchestrator.kg,
            center_lat=anchor_lat,
            center_lon=anchor_lon,
            category=user_input.business_category,
            radius_km=user_input.preferred_market_radius_km
        )
        return {"status": "SUCCESS", "data": threats.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================================
# 5. PRODUCT / COMMODITY VALUATION
# =====================================================================

@app.get("/api/v1/data/valuation")
def get_product_valuation(
    commodity: str = Query(..., min_length=2),
    state: Optional[str] = "National",
    district: Optional[str] = "Regional APMC"
):
    """
    Returns official Agmarknet / eNAM price benchmarks (modal, min, max, unit).
    """
    res = ProductValuationEngine.get_valuation(
        product_or_commodity=commodity,
        state=state or "National",
        district=district or "Regional APMC"
    )
    if not res:
        raise HTTPException(status_code=404, detail=f"No pricing benchmark found for '{commodity}'.")
    return {"status": "SUCCESS", "data": res.model_dump()}


# =====================================================================
# 6. UNIFIED HYPER-LOCAL PIPELINE (WITH ML FEATURE CONTRACTS)
# =====================================================================

@app.post("/api/v1/data/pipeline")
def run_pipeline(user_input: UserInputData):
    """
    Executes full hyper-local data intelligence pipeline.
    Constructs validated ML feature payloads for Models 1, 2, and 3 with zero leakage checks.
    """
    try:
        result = orchestrator.run_hyper_local_pipeline(user_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


# =====================================================================
# 7. KNOWLEDGE GRAPH EXPLORER
# =====================================================================

@app.get("/api/v1/kg/stats")
def get_kg_stats():
    return {
        "status": "SUCCESS",
        "total_nodes": len(orchestrator.kg.nodes),
        "total_edges": sum(len(e) for e in orchestrator.kg.out_edges.values()),
        "categories_indexed": len(orchestrator.kg.category_index)
    }


@app.get("/api/v1/kg/nearby-markets")
def get_nearby_markets(
    latitude: float = Query(..., ge=6.0, le=38.0),
    longitude: float = Query(..., ge=68.0, le=98.0),
    radius_km: float = Query(20.0, ge=1.0, le=100.0)
):
    markets = orchestrator.kg.query_nearby_markets(latitude, longitude, radius_km)
    return {"status": "SUCCESS", "count": len(markets), "markets": markets}


# =====================================================================
# 8. BACKWARD COMPATIBILITY (Census Tables & Legacy Location Endpoint)
# =====================================================================

@app.get("/api/population")
def get_population(state: Optional[str] = None):
    try:
        df = load_population_df()
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        return {"status": "success", "total_records": len(df), "data": df.fillna("").to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/housing")
def get_housing(state: Optional[str] = None):
    try:
        df = load_housing_df()
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        return {"status": "success", "total_records": len(df), "data": df.fillna("").to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/locations/{location_id}/statistics")
def get_location_statistics(location_id: str):
    """
    Upgraded legacy statistics endpoint satisfying locationApi.ts.
    REPLACES old 2% arbitrary state population bug with block-level spatial density extrapolation!
    """
    try:
        search_target = location_id.strip().lower()

        # Check if location matches an indexed subdistrict first
        demo_match = None
        for k, v in orchestrator.demographics_index.items():
            parts = k.split("|")
            if parts[0].lower() == search_target or parts[1].lower() == search_target or parts[2].lower() == search_target:
                demo_match = v
                break

        if demo_match:
            pop_5km, _, _ = estimate_population_in_radius(
                radius_km=5.0,
                subdistrict_population=demo_match["total_population"],
                subdistrict_area_sqkm=demo_match["area_sqkm"],
                subdistrict_density=demo_match["population_density_sqkm"]
            )
            pop_10km, _, _ = estimate_population_in_radius(
                radius_km=10.0,
                subdistrict_population=demo_match["total_population"],
                subdistrict_area_sqkm=demo_match["area_sqkm"],
                subdistrict_density=demo_match["population_density_sqkm"]
            )
            total_pop = demo_match["total_population"]
            households = demo_match["total_households"]
            area_sqkm = demo_match["area_sqkm"]
            density = demo_match["population_density_sqkm"]
        else:
            # Fallback to state dataset if block not indexed
            pop_df = load_population_df()
            house_df = load_housing_df()
            pop_match = pop_df[(pop_df["state"].str.lower() == search_target) & (pop_df["area_type"].str.lower() == "total")]
            if pop_match.empty:
                raise HTTPException(status_code=404, detail=f"No census data found for location: {location_id}")
            pop_row = pop_match.iloc[0]
            total_pop = int(pop_row.get("total_population", 0))
            households = int(pop_row.get("households", 0))
            # Safe rural density proxy (400 persons/sqkm)
            pop_5km, _, _ = estimate_population_in_radius(5.0, total_pop, 1000.0, 400.0)
            pop_10km, _, _ = estimate_population_in_radius(10.0, total_pop, 1000.0, 400.0)

        return {
            "reach": {
                "radius5km": pop_5km,
                "radius10km": pop_10km
            },
            "demandIndicators": [
                f"{total_pop:,} administrative population baseline",
                f"{pop_5km:,} estimated consumer reach in 5km hyper-local catchment"
            ],
            "localObservations": [
                f"Catchment density: ~{int(pop_5km / 78.5)} persons/sq.km",
                f"Household base: {households:,}"
            ],
            "customerSegments": [
                "Rural Households",
                "Local Market Traders"
            ],
            "marketSizeValue": pop_10km,
            "marketTrends": [
                "Demographic density catchment analysis",
                "Hyper-local rural consumption patterns"
            ],
            "evidenceSources": [
                "Census of India 2011 Primary Census Abstract (Sub-district PCA)",
                "VentureRoot Geospatial Density Model"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))