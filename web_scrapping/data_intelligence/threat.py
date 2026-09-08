"""
VentureRoot Threat Analysis Engine
==================================
Identifies commercial and operational vulnerability factors for hyper-local businesses:
- Hyper-proximity threat (competitors within 1 km)
- Over-saturation threat (high category density)
- Supply-chain and raw material seasonal bottlenecks
- Single-buyer or unorganized distribution vulnerability
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .authority import AuthorityLevel, DataProvenance
from .competitor import CompetitorIntelligenceEngine
from .knowledge_graph import VentureRootKnowledgeGraph
from .normalization import normalize_business_category
from .schemas import ThreatAnalysisResult, ThreatLevel


class ThreatAnalysisEngine:
    """
    Evaluates micro-market threats based on proximity, market saturation, and commodity dependency.
    """

    @classmethod
    def evaluate_threats(
        cls,
        kg: VentureRootKnowledgeGraph,
        center_lat: float,
        center_lon: float,
        category: str,
        radius_km: float = 10.0
    ) -> ThreatAnalysisResult:
        norm_cat = normalize_business_category(category)

        # Query competitors
        comp_data = kg.query_competitors_within_radius(center_lat, center_lon, norm_cat, radius_km=radius_km)
        count_radius = comp_data["competitor_count_radius"]
        nearest_dist = comp_data["nearest_distance_km"]

        # Calculate saturation index
        sat_index, _ = CompetitorIntelligenceEngine.compute_local_saturation(count_radius, radius_km)

        threats: List[Dict[str, Any]] = []
        mitigations: List[str] = []

        # 1. Proximity threat
        if nearest_dist is not None and nearest_dist < 1.0:
            threats.append({
                "factor": "HYPER_PROXIMITY_COMPETITOR",
                "severity": "HIGH",
                "description": f"Direct competitor located within {round(nearest_dist * 1000)} meters."
            })
            mitigations.append("Differentiate through superior packaging, doorstep delivery, or specialized SKUs.")
        elif nearest_dist is not None and nearest_dist < 3.0:
            threats.append({
                "factor": "MODERATE_PROXIMITY_COMPETITOR",
                "severity": "MODERATE",
                "description": f"Nearest competitor located at {nearest_dist:.2f} km."
            })

        # 2. Saturation threat
        if sat_index >= 0.8:
            threats.append({
                "factor": "CATEGORY_OVERSATURATION",
                "severity": "HIGH",
                "description": f"Category saturation is at {int(sat_index * 100)}% with {count_radius} competitors in {radius_km}km."
            })
            mitigations.append("Focus on underserved institutional buyers (schools, canteens, local dhabas) rather than retail footfall.")

        # 3. Category-specific supply/seasonality factors
        if norm_cat in ("Dairy Processing", "Food Processing & Agri"):
            threats.append({
                "factor": "PERISHABLE_SPOILAGE_RISK",
                "severity": "MODERATE",
                "description": "Perishable raw materials require cold storage or immediate same-day processing."
            })
            mitigations.append("Establish pre-arranged procurement contracts and cold-chain/chiller backup.")
        elif norm_cat in ("Poultry & Livestock Farming",):
            threats.append({
                "factor": "FEED_PRICE_VOLATILITY",
                "severity": "MODERATE",
                "description": "Feed prices (maize/soymeal) fluctuate with national commodity markets."
            })
            mitigations.append("Secure cooperative feed purchases in bulk during harvest post-season.")

        # Overall Threat Level assessment
        if any(t["severity"] == "HIGH" for t in threats) or sat_index > 0.85:
            overall_level = ThreatLevel.HIGH if sat_index < 0.95 else ThreatLevel.SEVERE
        elif threats or sat_index > 0.4:
            overall_level = ThreatLevel.MODERATE
        else:
            overall_level = ThreatLevel.LOW

        if not mitigations:
            mitigations.append("Maintain agile inventory and customer credit discipline.")

        prov = [
            DataProvenance(
                source_name="VentureRoot Threat Intelligence Engine",
                source_type="INFERRED_ANALYTICS",
                authority_level=AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS
            )
        ]

        return ThreatAnalysisResult(
            category=norm_cat,
            saturation_index=sat_index,
            threat_level=overall_level,
            nearest_competitor_distance_km=nearest_dist,
            identified_threats=threats,
            suggested_mitigations=mitigations,
            provenance=prov
        )
