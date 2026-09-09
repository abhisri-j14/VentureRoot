"""
VentureRoot Hyper-Local Geolocation & Geospatial Math Engine
============================================================
Implements:
- High-precision Haversine spherical distance calculation (WGS-84 mean radius)
- Fast bounding box calculation for indexing/filtering
- Catchment radius filtering (5 km, 10 km, configurable)
- Spatial demographic extrapolation (circle area * subdistrict density)
- Geographic coordinate bounding validation (India extent)
- Centroid resolution fallback for rural administrative units
"""

import math
from typing import Any, Dict, List, Optional, Tuple

# WGS-84 Earth mean radius in kilometers
EARTH_RADIUS_KM = 6371.0088

# India Geographic Bounding Box
INDIA_LAT_MIN = 6.0
INDIA_LAT_MAX = 38.0
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 98.0


def validate_coordinates(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
    """
    Validates if coordinates fall within the geographical boundary of India.
    """
    if not (INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX):
        return False, f"Latitude {lat:.4f} is outside valid India bounds [{INDIA_LAT_MIN}, {INDIA_LAT_MAX}]"
    if not (INDIA_LON_MIN <= lon <= INDIA_LON_MAX):
        return False, f"Longitude {lon:.4f} is outside valid India bounds [{INDIA_LON_MIN}, {INDIA_LON_MAX}]"
    return True, None


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes the great-circle distance between two points on a sphere
    using the high-precision Haversine formula.
    
    Returns distance in kilometers.
    """
    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine formula
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    # Clamp value to prevent numerical domain errors with atan2
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(EARTH_RADIUS_KM * c, 4)


def bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculates a geographic bounding box [min_lat, max_lat, min_lon, max_lon]
    around a center point for rapid spatial pruning before exact Haversine calculation.
    """
    # 1 degree latitude is approx 111.32 km
    delta_lat = radius_km / 111.32

    # 1 degree longitude varies with latitude: 111.32 * cos(lat)
    rad_lat = math.radians(lat)
    cos_lat = math.cos(rad_lat)
    if cos_lat < 1e-6:
        delta_lon = radius_km / 111.32
    else:
        delta_lon = radius_km / (111.32 * cos_lat)

    min_lat = max(INDIA_LAT_MIN, lat - delta_lat)
    max_lat = min(INDIA_LAT_MAX, lat + delta_lat)
    min_lon = max(INDIA_LON_MIN, lon - delta_lon)
    max_lon = min(INDIA_LON_MAX, lon + delta_lon)

    return (round(min_lat, 6), round(max_lat, 6), round(min_lon, 6), round(max_lon, 6))


def filter_within_radius(
    center_lat: float,
    center_lon: float,
    entities: List[Dict[str, Any]],
    radius_km: float,
    lat_field: str = "latitude",
    lon_field: str = "longitude"
) -> List[Dict[str, Any]]:
    """
    Filters a collection of spatial entities within a specified radius (km).
    Adds 'distance_km' to each matching entity dictionary.
    Sorted by ascending distance from center.
    """
    min_lat, max_lat, min_lon, max_lon = bounding_box(center_lat, center_lon, radius_km)
    results = []

    for entity in entities:
        lat = entity.get(lat_field)
        lon = entity.get(lon_field)
        if lat is None or lon is None:
            continue

        try:
            f_lat = float(lat)
            f_lon = float(lon)
        except (ValueError, TypeError):
            continue

        # Fast bounding box rejection
        if not (min_lat <= f_lat <= max_lat and min_lon <= f_lon <= max_lon):
            continue

        # Precise Haversine calculation
        dist = haversine_distance(center_lat, center_lon, f_lat, f_lon)
        if dist <= radius_km:
            entity_copy = dict(entity)
            entity_copy["distance_km"] = dist
            results.append(entity_copy)

    results.sort(key=lambda x: x["distance_km"])
    return results


def estimate_population_in_radius(
    radius_km: float,
    subdistrict_population: int,
    subdistrict_area_sqkm: float,
    subdistrict_density: Optional[float] = None
) -> Tuple[int, int, Dict[str, Any]]:
    """
    Calculates estimated population and households within a catchment circle (e.g. 5km, 10km).
    
    Formula:
    Circle Area A = pi * r^2
    Population Estimate = round(A * subdistrict_density)
    Capped at total subdistrict population (if circle exceeds subdistrict boundary).
    Households estimated at average 5 persons per rural Indian household.
    
    Returns:
    (population_estimate, households_estimate, metadata_dict)
    """
    circle_area = math.pi * (radius_km ** 2)

    if subdistrict_density is None or subdistrict_density <= 0:
        if subdistrict_area_sqkm > 0:
            density = subdistrict_population / subdistrict_area_sqkm
        else:
            density = 400.0  # Indian average rural density baseline
    else:
        density = subdistrict_density

    raw_pop_estimate = round(circle_area * density)
    
    # Cap at subdistrict population if circle encompasses the entire block
    if subdistrict_population > 0 and raw_pop_estimate > subdistrict_population:
        pop_estimate = subdistrict_population
        is_capped = True
    else:
        pop_estimate = raw_pop_estimate
        is_capped = False

    households_estimate = max(1, round(pop_estimate / 5.0))

    metadata = {
        "radius_km": radius_km,
        "circle_area_sqkm": round(circle_area, 2),
        "applied_density_per_sqkm": round(density, 2),
        "is_capped_at_block_population": is_capped,
        "is_exact_census_count": False,
        "methodology": "SPATIAL_DENSITY_EXTRAPOLATION",
        "notice": (
            f"Population in {radius_km}km catchment estimated via block spatial density "
            f"({round(density, 1)} persons/sq.km). Not an exact village census count."
        )
    }

    return pop_estimate, households_estimate, metadata
