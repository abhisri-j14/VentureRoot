"""
VentureRoot Hyper-Local Intelligence Pipeline Orchestrator
==========================================================
Coordinates:
1. User Input validation & normalization
2. Administrative Census PCA demographic lookup & centroid resolution
3. Knowledge Graph population (Administrative + Commercial + Markets)
4. Catchment Market Reach calculation (5 km & 10 km)
5. Competitor intelligence, deduplication, density, and saturation
6. Opportunity analysis & underserved category detection
7. Micro-market threat identification & actionable mitigations
8. Product & commodity benchmark valuation
9. ML Feature Contract construction with Zero Data Leakage verification
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .authority import AuthorityLevel, ConfidenceStatus, DataProvenance, FreshnessStatus
from .competitor import CompetitorIntelligenceEngine
from .feature_contract import validate_feature_contract
from .geo import (
    estimate_population_in_radius,
    haversine_distance,
    validate_coordinates
)
from .knowledge_graph import (
    EntityType,
    KGEdge,
    KGNode,
    RelationType,
    VentureRootKnowledgeGraph
)
from .normalization import (
    normalize_business_category,
    normalize_state_name,
    validate_and_normalize_coordinates
)
from .opportunity import OpportunityAnalysisEngine
from .resilience import SystemResilienceManager
from .schemas import (
    CompetitorRecord,
    CustomerType,
    DemographicProfile,
    MarketCluster,
    MarketReachResult,
    OpportunityAnalysisResult,
    StructuredWarning,
    ThreatAnalysisResult,
    UserInputData,
    WarningCode
)
from .threat import ThreatAnalysisEngine
from .valuation import ProductValuationEngine

logger = logging.getLogger("ventureroot.orchestrator")

DATA_DIR = Path(__file__).resolve().parent / "data"


class HyperLocalOrchestrator:
    """
    Main entry point for VentureRoot Step 2 Data Architecture & Intelligence Layer.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or DATA_DIR
        self.kg = VentureRootKnowledgeGraph()
        self.demographics_index: Dict[str, Dict[str, Any]] = {}
        self.raw_businesses: List[Dict[str, Any]] = []
        self.raw_markets: List[Dict[str, Any]] = []
        self._load_reference_data()
        self._build_knowledge_graph()

    def _load_reference_data(self):
        """Loads static seed census, business, and market files into memory."""
        # 1. Census PCA Demographics
        census_file = self.data_dir / "census_pca_sample.json"
        if census_file.exists():
            with open(census_file, "r", encoding="utf-8") as f:
                records = json.load(f)
                for r in records:
                    key = f"{normalize_state_name(r['state'])}|{r['district'].strip().lower()}|{r['subdistrict'].strip().lower()}"
                    self.demographics_index[key] = r

        # 2. Businesses / Competitors
        biz_file = self.data_dir / "businesses_sample.json"
        if biz_file.exists():
            with open(biz_file, "r", encoding="utf-8") as f:
                self.raw_businesses = json.load(f)

        # 3. Markets / Mandis / Haats
        mkt_file = self.data_dir / "markets_sample.json"
        if mkt_file.exists():
            with open(mkt_file, "r", encoding="utf-8") as f:
                self.raw_markets = json.load(f)

    def _build_knowledge_graph(self):
        """Constructs knowledge graph nodes and edges from reference datasets."""
        self.kg.clear()

        # Ingest Markets
        for m in self.raw_markets:
            m_node = KGNode(
                node_id=m["market_id"],
                entity_type=EntityType.MARKET,
                name=m["name"],
                properties={
                    "market_type": m.get("market_type", "HAAT_MANDI"),
                    "latitude": m["latitude"],
                    "longitude": m["longitude"],
                    "operating_days": m.get("operating_days", "DAILY"),
                    "state": m.get("state"),
                    "district": m.get("district")
                },
                provenance=DataProvenance(
                    source_name=m.get("source", "Market Registry"),
                    source_type="PUBLIC_MANDI_DATA",
                    authority_level=AuthorityLevel(m.get("authority_level", "LEVEL_1_CENTRAL_GOVERNMENT"))
                )
            )
            self.kg.add_node(m_node)

        # Ingest Businesses / Competitors
        competitor_records: List[CompetitorRecord] = []
        for b in self.raw_businesses:
            rec = CompetitorIntelligenceEngine.ingest_record(b)
            if rec:
                competitor_records.append(rec)

        # Deduplicate
        deduped = CompetitorIntelligenceEngine.deduplicate_records(competitor_records)

        for c in deduped:
            c_node = KGNode(
                node_id=c.business_id,
                entity_type=EntityType.COMPETITOR if c.is_direct_competitor else EntityType.BUSINESS,
                name=c.normalized_name,
                properties={
                    "category": c.category,
                    "subcategory": c.subcategory,
                    "products_services": c.products_services,
                    "address": c.address,
                    "latitude": c.latitude,
                    "longitude": c.longitude,
                    "state": c.state,
                    "district": c.district,
                    "is_duplicate": c.is_duplicate,
                    "possible_duplicate_of": c.possible_duplicate_of
                },
                provenance=c.provenance
            )
            self.kg.add_node(c_node)

            # Category Node and Edge
            cat_node_id = f"cat_{normalize_business_category(c.category).replace(' ', '_').lower()}"
            if not self.kg.get_node(cat_node_id):
                self.kg.add_node(KGNode(
                    node_id=cat_node_id,
                    entity_type=EntityType.BUSINESS_CATEGORY,
                    name=normalize_business_category(c.category)
                ))
            self.kg.add_edge(KGEdge(
                source_id=c.business_id,
                target_id=cat_node_id,
                relation_type=RelationType.BELONGS_TO_CATEGORY
            ))

    def resolve_demographics(
        self,
        state: str,
        district: str,
        block: str
    ) -> Tuple[Optional[DemographicProfile], List[StructuredWarning]]:
        """
        Retrieves official Census PCA demographic profile for the given administrative block.
        """
        warnings: List[StructuredWarning] = []
        norm_state = normalize_state_name(state)
        key = f"{norm_state}|{district.strip().lower()}|{block.strip().lower()}"
        match = self.demographics_index.get(key)

        if not match:
            # Try fuzzy fallback by state + subdistrict
            for k, v in self.demographics_index.items():
                parts = k.split("|")
                if parts[0] == norm_state and parts[2] == block.strip().lower():
                    match = v
                    break

        if not match:
            # Fallback baseline demographic profile if specific subdistrict is unlisted in sample
            warnings.append(SystemResilienceManager.warn_insufficient_local_data(
                domain="Census Sub-district PCA",
                catchment_km=10.0
            ))
            # Safe synthetic baseline for testing unindexed regions
            prov = DataProvenance(
                source_name="Census of India 2011 (State Rural Average Proxy)",
                source_type="REGIONAL_PROXY",
                authority_level=AuthorityLevel.LEVEL_1_CENTRAL_GOVERNMENT,
                confidence_status=ConfidenceStatus.ESTIMATED
            )
            profile = DemographicProfile(
                state=norm_state,
                district=district,
                subdistrict_or_block=block,
                total_population=250000,
                total_households=50000,
                male_population=128000,
                female_population=122000,
                literacy_rate=70.0,
                working_population=95000,
                area_sqkm=300.0,
                population_density_sqkm=833.3,
                provenance=prov
            )
            return profile, warnings

        prov = DataProvenance(
            source_name="Census of India 2011 Primary Census Abstract (PCA)",
            source_type="GOVERNMENT_CENSUS",
            authority_level=AuthorityLevel.LEVEL_1_CENTRAL_GOVERNMENT,
            confidence_status=ConfidenceStatus.VERIFIED
        )

        profile = DemographicProfile(
            state=match["state"],
            district=match["district"],
            subdistrict_or_block=match["subdistrict"],
            census_code=match.get("census_code"),
            total_population=match["total_population"],
            total_households=match["total_households"],
            male_population=match["male_population"],
            female_population=match["female_population"],
            literacy_rate=match["literacy_rate"],
            working_population=match["working_population"],
            area_sqkm=match["area_sqkm"],
            population_density_sqkm=match["population_density_sqkm"],
            provenance=prov
        )
        return profile, warnings

    def resolve_anchor_coordinates(
        self,
        user_input: UserInputData,
        demo_profile: Optional[DemographicProfile]
    ) -> Tuple[float, float, List[StructuredWarning]]:
        """
        Determines anchor latitude/longitude. If user omitted coordinates, resolves
        via subdistrict centroid or default state coordinates.
        """
        warnings: List[StructuredWarning] = []
        if user_input.latitude is not None and user_input.longitude is not None:
            is_valid, err = validate_coordinates(user_input.latitude, user_input.longitude)
            if is_valid:
                return user_input.latitude, user_input.longitude, warnings
            else:
                warnings.append(StructuredWarning(
                    code=WarningCode.LOCATION_NOT_FOUND,
                    message=f"User-provided coordinates invalid: {err}. Falling back to block centroid."
                ))

        # Check demographic profile centroid
        norm_state = normalize_state_name(user_input.state)
        key = f"{norm_state}|{user_input.district.strip().lower()}|{user_input.block.strip().lower()}"
        demo_record = self.demographics_index.get(key)
        if demo_record and "centroid_lat" in demo_record and "centroid_lon" in demo_record:
            lat = float(demo_record["centroid_lat"])
            lon = float(demo_record["centroid_lon"])
            warnings.append(SystemResilienceManager.warn_centroid_resolved(user_input.block, (lat, lon)))
            return lat, lon, warnings

        # Default fallback coordinate for rural West Bengal testing cluster
        lat, lon = 23.4167, 87.9167
        warnings.append(SystemResilienceManager.warn_centroid_resolved(user_input.block, (lat, lon)))
        return lat, lon, warnings

    def execute_market_reach(
        self,
        user_input: UserInputData,
        anchor_lat: float,
        anchor_lon: float,
        demo_profile: DemographicProfile
    ) -> MarketReachResult:
        """
        Computes hyper-local market reach within preferred radius (e.g. 10 km).
        """
        radius_km = user_input.preferred_market_radius_km
        pop_est, hh_est, pop_meta = estimate_population_in_radius(
            radius_km=radius_km,
            subdistrict_population=demo_profile.total_population,
            subdistrict_area_sqkm=demo_profile.area_sqkm,
            subdistrict_density=demo_profile.population_density_sqkm
        )

        norm_cat = normalize_business_category(user_input.business_category)

        # Query all businesses and competitors in catchment
        all_businesses = self.kg.get_businesses_in_radius(anchor_lat, anchor_lon, radius_km)
        category_competitors = self.kg.get_businesses_in_radius(anchor_lat, anchor_lon, radius_km, category=norm_cat)

        circle_area = pop_meta["circle_area_sqkm"]
        comp_density = round(len(category_competitors) / max(circle_area, 1.0), 4)

        # Build CompetitorRecord list for nearest competitors
        nearest_comps: List[CompetitorRecord] = []
        for c in category_competitors[:5]:
            node = self.kg.get_node(c["node_id"])
            if node:
                nearest_comps.append(CompetitorRecord(
                    business_id=node.node_id,
                    raw_name=node.name,
                    normalized_name=node.name,
                    category=node.properties.get("category", norm_cat),
                    address=node.properties.get("address", ""),
                    state=node.properties.get("state", user_input.state),
                    district=node.properties.get("district", user_input.district),
                    latitude=node.properties.get("latitude", anchor_lat),
                    longitude=node.properties.get("longitude", anchor_lon),
                    distance_km=c["distance_km"],
                    is_duplicate=node.properties.get("is_duplicate", False),
                    possible_duplicate_of=node.properties.get("possible_duplicate_of"),
                    provenance=node.provenance
                ))

        # Query nearby markets
        markets_raw = self.kg.query_nearby_markets(anchor_lat, anchor_lon, radius_km=20.0)
        market_clusters = [
            MarketCluster(
                name=m["name"],
                cluster_type=m["market_type"],
                distance_km=m["distance_km"],
                latitude=m["latitude"],
                longitude=m["longitude"]
            )
            for m in markets_raw[:3]
        ]

        warnings = [
            f"Population in {radius_km}km catchment estimated via block spatial density ({demo_profile.population_density_sqkm:.1f} / sq.km). Not an exact village census count."
        ]

        return MarketReachResult(
            anchor_location={
                "state": user_input.state,
                "district": user_input.district,
                "block": user_input.block,
                "village": user_input.village,
                "latitude": anchor_lat,
                "longitude": anchor_lon
            },
            radius_km=radius_km,
            area_covered_sqkm=circle_area,
            population_estimate=pop_est,
            is_exact_census_count=False,
            estimation_methodology=pop_meta["methodology"],
            households_estimate=hh_est,
            total_businesses_in_radius=len(all_businesses),
            competitors_in_radius=len(category_competitors),
            competitor_density_per_sqkm=comp_density,
            nearest_competitors=nearest_comps,
            market_clusters=market_clusters,
            data_sources=[
                demo_profile.provenance,
                DataProvenance(
                    source_name="VentureRoot Knowledge Graph",
                    source_type="INTERNAL_GRAPH",
                    authority_level=AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS
                )
            ],
            warnings=warnings
        )

    def run_hyper_local_pipeline(self, user_input: UserInputData) -> Dict[str, Any]:
        """
        Executes end-to-end hyper-local intelligence pipeline.
        Returns complete, structured payload with ML feature contracts and full provenance.
        """
        pipeline_warnings: List[StructuredWarning] = []

        # 1. Resolve Demographics
        demo_profile, demo_warns = self.resolve_demographics(
            user_input.state,
            user_input.district,
            user_input.block
        )
        pipeline_warnings.extend(demo_warns)

        # 2. Resolve Anchor Coordinates
        anchor_lat, anchor_lon, coord_warns = self.resolve_anchor_coordinates(user_input, demo_profile)
        pipeline_warnings.extend(coord_warns)

        # 3. Market Reach Analysis
        market_reach = self.execute_market_reach(user_input, anchor_lat, anchor_lon, demo_profile)

        # 4. Opportunity Analysis
        opp_analysis = OpportunityAnalysisEngine.evaluate_opportunity(
            kg=self.kg,
            center_lat=anchor_lat,
            center_lon=anchor_lon,
            target_category=user_input.business_category,
            proposed_product_service=user_input.proposed_product_service,
            radius_km=user_input.preferred_market_radius_km,
            demographic_pop_estimate=market_reach.population_estimate
        )

        # 5. Threat Analysis
        threat_analysis = ThreatAnalysisEngine.evaluate_threats(
            kg=self.kg,
            center_lat=anchor_lat,
            center_lon=anchor_lon,
            category=user_input.business_category,
            radius_km=user_input.preferred_market_radius_km
        )

        # 6. Product Valuation
        valuation = ProductValuationEngine.get_valuation(
            product_or_commodity=user_input.proposed_product_service,
            state=user_input.state,
            district=user_input.district
        )

        # 7. Construct ML Feature Payloads (Zero Data Leakage Guaranteed)
        m1_features = {
            "total_population": demo_profile.total_population,
            "total_households": demo_profile.total_households,
            "literacy_rate": demo_profile.literacy_rate,
            "population_density_sqkm": demo_profile.population_density_sqkm
        }
        m1_valid, m1_err, m1_warn = validate_feature_contract("model_1", m1_features)

        m2_features = {
            "available_margin_capital": user_input.available_margin_capital,
            "entrepreneur_experience_years": user_input.entrepreneur_experience_years,
            "competitor_count_5km": opp_analysis.competitor_count_5km,
            "competitor_count_10km": opp_analysis.competitor_count_10km,
            "market_saturation_index": threat_analysis.saturation_index,
            "catchment_population_estimate": market_reach.population_estimate
        }
        m2_valid, m2_err, m2_warn = validate_feature_contract("model_2", m2_features)

        m3_features = {
            "commodity_normalized": valuation.normalized_name if valuation else "General Agro-Goods",
            "modal_price_benchmark": valuation.modal_price_inr if valuation else 2200.0,
            "month_of_year": 9  # Current harvest/post-monsoon cycle
        }
        m3_valid, m3_err, m3_warn = validate_feature_contract("model_3", m3_features)

        return {
            "status": "SUCCESS",
            "user_input": user_input.model_dump(),
            "demographic_profile": demo_profile.model_dump(),
            "market_reach": market_reach.model_dump(),
            "opportunity_analysis": opp_analysis.model_dump(),
            "threat_analysis": threat_analysis.model_dump(),
            "product_valuation": valuation.model_dump() if valuation else None,
            "ml_feature_contracts": {
                "model_1": {
                    "features": m1_features,
                    "is_valid": m1_valid,
                    "errors": m1_err,
                    "warnings": m1_warn
                },
                "model_2": {
                    "features": m2_features,
                    "is_valid": m2_valid,
                    "errors": m2_err,
                    "warnings": m2_warn
                },
                "model_3": {
                    "features": m3_features,
                    "is_valid": m3_valid,
                    "errors": m3_err,
                    "warnings": m3_warn
                }
            },
            "system_warnings": [w.model_dump() for w in pipeline_warnings]
        }
