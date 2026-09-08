"""
VentureRoot Opportunity Analysis Engine
=======================================
Generates evidence-backed commercial opportunity signals for rural & semi-urban catchments.
- Identifies high/low competition categories within 5km and 10km.
- Pinpoints underserved essential commercial categories.
- Evaluates demand signals from local demographics and mandi/market proximity.
- Adheres to Safety Principle: Provides empirical local evidence, NOT speculative success guarantees.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .authority import AuthorityLevel, ConfidenceStatus, DataProvenance
from .competitor import CompetitorIntelligenceEngine
from .knowledge_graph import VentureRootKnowledgeGraph
from .normalization import normalize_business_category
from .schemas import OpportunityAnalysisResult, OpportunityLevel


class OpportunityAnalysisEngine:
    """
    Synthesizes spatial competitor metrics, catchment demographics, and commercial clusters
    into structured empirical evidence for entrepreneur evaluation.
    """

    @classmethod
    def evaluate_opportunity(
        cls,
        kg: VentureRootKnowledgeGraph,
        center_lat: float,
        center_lon: float,
        target_category: str,
        proposed_product_service: str,
        radius_km: float = 10.0,
        demographic_pop_estimate: Optional[int] = None
    ) -> OpportunityAnalysisResult:
        """
        Runs empirical opportunity assessment within radius.
        """
        norm_cat = normalize_business_category(target_category)

        # 1. Query competitor distribution via KG
        comp_5km = kg.query_competitors_within_radius(center_lat, center_lon, norm_cat, radius_km=5.0)
        comp_10km = kg.query_competitors_within_radius(center_lat, center_lon, norm_cat, radius_km=radius_km)

        count_5km = comp_5km["competitor_count_5km"]
        count_radius = comp_10km["competitor_count_radius"]

        # 2. Local saturation and density level
        sat_index, density_status = CompetitorIntelligenceEngine.compute_local_saturation(
            competitor_count=count_radius,
            radius_km=radius_km
        )

        # 3. Detect underserved categories in catchment
        underserved = kg.query_underserved_categories(center_lat, center_lon, radius_km=radius_km)

        # 4. Determine Opportunity Signal (Evidence-based classification)
        evidence: List[str] = []
        if count_5km == 0:
            evidence.append(f"Zero direct competitors in immediate 5 km radius for '{norm_cat}'.")
            if count_radius <= 2:
                opp_signal = OpportunityLevel.HIGH_OPPORTUNITY
                evidence.append(f"Only {count_radius} competitor(s) operating within the full {radius_km} km catchment.")
            else:
                opp_signal = OpportunityLevel.MODERATE_OPPORTUNITY
                evidence.append(f"{count_radius} competitors exist between 5 km and {radius_km} km boundary.")
        elif count_5km <= 2:
            opp_signal = OpportunityLevel.MODERATE_OPPORTUNITY
            evidence.append(f"Moderate local presence: {count_5km} competitor(s) within 5 km.")
        elif count_5km <= 5:
            opp_signal = OpportunityLevel.SATURATED
            evidence.append(f"High competitive clustering: {count_5km} competitors within 5 km.")
        else:
            opp_signal = OpportunityLevel.OVER_SATURATED
            evidence.append(f"Market saturation: {count_5km} direct competitors within 5 km and {count_radius} in {radius_km} km.")

        if norm_cat in underserved:
            evidence.append(f"'{norm_cat}' is currently unrepresented in the immediate local business ecosystem.")

        # 5. Demand signals
        demand_signals: List[Dict[str, Any]] = []
        if demographic_pop_estimate and demographic_pop_estimate > 0:
            evidence.append(f"Estimated catchment population of {demographic_pop_estimate:,} residents.")
            demand_signals.append({
                "signal_type": "POPULATION_BASE",
                "metric_value": demographic_pop_estimate,
                "interpretation": "Substantial consumer pool for essential daily goods and agro-processing."
            })

        # Check nearby markets
        nearby_markets = kg.query_nearby_markets(center_lat, center_lon, radius_km=15.0)
        if nearby_markets:
            nearest_mkt = nearby_markets[0]
            evidence.append(f"Proximity to {nearest_mkt['name']} ({nearest_mkt['distance_km']} km) offers distribution access.")
            demand_signals.append({
                "signal_type": "MARKET_ACCESS",
                "nearest_market": nearest_mkt["name"],
                "distance_km": nearest_mkt["distance_km"],
                "market_type": nearest_mkt.get("market_type")
            })

        provenance = [
            DataProvenance(
                source_name="VentureRoot Knowledge Graph Engine",
                source_type="INFERRED_ANALYTICS",
                authority_level=AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS
            )
        ]

        return OpportunityAnalysisResult(
            target_category=norm_cat,
            proposed_product_service=proposed_product_service,
            radius_km=radius_km,
            competitor_count_5km=count_5km,
            competitor_count_10km=count_radius,
            market_density_status=density_status,
            opportunity_signal=opp_signal,
            evidence=evidence,
            underserved_categories_in_catchment=underserved[:5],
            demand_signals=demand_signals,
            provenance=provenance,
            warnings=[]
        )
