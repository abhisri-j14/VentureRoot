"""
VentureRoot System Resilience & Graceful Degradation Engine
===========================================================
Standardizes failure modes and error diagnostics across data collection:
- Explicitly forbids silent fabrication of missing records
- Issues canonical structured warnings
- Implements fallback hierarchies (e.g. Village -> Block centroid)
- Returns machine-readable diagnostic payloads for frontend and ML layers
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from .schemas import StructuredWarning, WarningCode


class SystemResilienceManager:
    """
    Constructs standardized warnings and ensures graceful system degradation.
    """

    @staticmethod
    def warn_source_unavailable(source_name: str, reason: str, mitigation: Optional[str] = None) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.DATA_SOURCE_UNAVAILABLE,
            message=f"Data source '{source_name}' is currently unreachable: {reason}",
            affected_source=source_name,
            mitigation=mitigation or "Falling back to cached baseline or regional government proxy."
        )

    @staticmethod
    def warn_data_stale(source_name: str, age_description: str) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.DATA_STALE,
            message=f"Data from '{source_name}' is aging or stale ({age_description}).",
            affected_source=source_name,
            mitigation="Interpret with caution; fresh scraping scheduled during off-peak hours."
        )

    @staticmethod
    def warn_location_not_found(location_str: str) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.LOCATION_NOT_FOUND,
            message=f"Administrative location '{location_str}' could not be resolved to exact coordinates.",
            field="location",
            mitigation="Provide nearby block HQ or verify spelling against official census names."
        )

    @staticmethod
    def warn_insufficient_local_data(domain: str, catchment_km: float) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.INSUFFICIENT_LOCAL_DATA,
            message=f"Insufficient empirical {domain} records located within {catchment_km} km catchment.",
            mitigation="Expand analysis radius to 15 km or consider district-level benchmark proxy."
        )

    @staticmethod
    def warn_centroid_resolved(subdistrict_name: str, coords: tuple[float, float]) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.COORDINATES_RESOLVED_BY_CENTROID,
            message=f"Exact village coordinates unavailable. Resolved to subdistrict/block centroid ({coords[0]:.4f}, {coords[1]:.4f}) for '{subdistrict_name}'.",
            field="coordinates",
            mitigation="Proximity calculations will be centered on block administrative center."
        )

    @staticmethod
    def warn_population_proxy(radius_km: float, density_val: float) -> StructuredWarning:
        return StructuredWarning(
            code=WarningCode.ESTIMATED_POPULATION_PROXY,
            message=f"Population within {radius_km} km is estimated via block spatial density ({density_val:.1f} / sq.km).",
            field="population_estimate",
            mitigation="Do not treat as an exact village-by-village door count."
        )
