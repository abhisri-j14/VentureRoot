"""
VentureRoot Hyper-Local Knowledge Graph Engine
==============================================
Implements an in-memory, provenance-aware Property Graph representing:
- Administrative Hierarchy: State -> District -> Block -> Village
- Commercial Entities: Business, BusinessCategory, Product, Service, Commodity, Market, Competitor
- Explicit Relationships:
    LOCATED_IN, NEARBY, BELONGS_TO_CATEGORY, SELLS, PROVIDES,
    COMPETES_WITH, SERVES, PART_OF, SUPPLIED_BY, OPERATES_IN

Supports rich spatial and semantic graph queries:
- Competitors within radius (5km / 10km)
- Local business category density and saturation
- Underserved categories in catchment area
- Nearest commercial clusters and weekly haats/mandis
- Direct product/service availability in local geography
"""

from __future__ import annotations

import json
import logging
from collections import defaultdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

from .authority import AuthorityLevel, ConfidenceStatus, DataProvenance
from .geo import haversine_distance, filter_within_radius
from .normalization import normalize_business_category

logger = logging.getLogger("ventureroot.kg")


class EntityType(str, Enum):
    STATE = "State"
    DISTRICT = "District"
    BLOCK = "Block"
    VILLAGE = "Village"
    BUSINESS = "Business"
    BUSINESS_CATEGORY = "BusinessCategory"
    PRODUCT = "Product"
    SERVICE = "Service"
    COMMODITY = "Commodity"
    MARKET = "Market"
    COMPETITOR = "Competitor"


class RelationType(str, Enum):
    LOCATED_IN = "LOCATED_IN"
    NEARBY = "NEARBY"
    BELONGS_TO_CATEGORY = "BELONGS_TO_CATEGORY"
    SELLS = "SELLS"
    PROVIDES = "PROVIDES"
    COMPETES_WITH = "COMPETES_WITH"
    SERVES = "SERVES"
    PART_OF = "PART_OF"
    SUPPLIED_BY = "SUPPLIED_BY"
    OPERATES_IN = "OPERATES_IN"


class KGNode:
    """A node in the VentureRoot Knowledge Graph."""
    def __init__(
        self,
        node_id: str,
        entity_type: EntityType,
        name: str,
        properties: Optional[Dict[str, Any]] = None,
        provenance: Optional[DataProvenance] = None
    ):
        self.node_id = str(node_id)
        self.entity_type = entity_type
        self.name = name
        self.properties = properties or {}
        self.provenance = provenance or DataProvenance(
            source_name="VentureRoot Internal Knowledge Base",
            source_type="INTERNAL",
            authority_level=AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "entity_type": self.entity_type.value,
            "name": self.name,
            "properties": self.properties,
            "provenance": self.provenance.model_dump()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> KGNode:
        prov = DataProvenance(**data["provenance"]) if "provenance" in data else None
        return cls(
            node_id=data["node_id"],
            entity_type=EntityType(data["entity_type"]),
            name=data["name"],
            properties=data.get("properties", {}),
            provenance=prov
        )


class KGEdge:
    """A directed edge in the VentureRoot Knowledge Graph."""
    def __init__(
        self,
        source_id: str,
        target_id: str,
        relation_type: RelationType,
        properties: Optional[Dict[str, Any]] = None,
        provenance: Optional[DataProvenance] = None
    ):
        self.source_id = str(source_id)
        self.target_id = str(target_id)
        self.relation_type = relation_type
        self.properties = properties or {}
        self.provenance = provenance or DataProvenance(
            source_name="VentureRoot Graph Engine",
            source_type="INFERRED",
            authority_level=AuthorityLevel.LEVEL_3_PUBLIC_INSTITUTIONS
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "relation_type": self.relation_type.value,
            "properties": self.properties,
            "provenance": self.provenance.model_dump()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> KGEdge:
        prov = DataProvenance(**data["provenance"]) if "provenance" in data else None
        return cls(
            source_id=data["source_id"],
            target_id=data["target_id"],
            relation_type=RelationType(data["relation_type"]),
            properties=data.get("properties", {}),
            provenance=prov
        )


class VentureRootKnowledgeGraph:
    """
    Lightweight, high-performance property graph with spatial query extensions.
    Guarantees full data provenance on every node and edge.
    """
    def __init__(self):
        self.nodes: Dict[str, KGNode] = {}
        self.out_edges: Dict[str, List[KGEdge]] = defaultdict(list)
        self.in_edges: Dict[str, List[KGEdge]] = defaultdict(list)
        
        # Fast lookup indices
        self.nodes_by_type: Dict[EntityType, Set[str]] = defaultdict(set)
        self.category_index: Dict[str, Set[str]] = defaultdict(set)  # normalized_category -> node_ids

    def clear(self):
        self.nodes.clear()
        self.out_edges.clear()
        self.in_edges.clear()
        self.nodes_by_type.clear()
        self.category_index.clear()

    def add_node(self, node: KGNode) -> KGNode:
        self.nodes[node.node_id] = node
        self.nodes_by_type[node.entity_type].add(node.node_id)
        
        # Index category associations
        if node.entity_type in (EntityType.BUSINESS, EntityType.COMPETITOR):
            cat = node.properties.get("category")
            if cat:
                norm_cat = normalize_business_category(cat)
                self.category_index[norm_cat].add(node.node_id)
        elif node.entity_type == EntityType.BUSINESS_CATEGORY:
            self.category_index[normalize_business_category(node.name)].add(node.node_id)

        return node

    def add_edge(self, edge: KGEdge) -> KGEdge:
        self.out_edges[edge.source_id].append(edge)
        self.in_edges[edge.target_id].append(edge)
        return edge

    def get_node(self, node_id: str) -> Optional[KGNode]:
        return self.nodes.get(str(node_id))

    def get_neighbors(
        self,
        node_id: str,
        relation_type: Optional[RelationType] = None,
        direction: str = "OUT"
    ) -> List[Tuple[KGNode, KGEdge]]:
        """
        Retrieves adjacent nodes and connecting edges filtered by relation and direction.
        direction: 'OUT', 'IN', or 'BOTH'
        """
        results = []
        edges_to_scan = []

        if direction in ("OUT", "BOTH"):
            edges_to_scan.extend([(e, e.target_id) for e in self.out_edges.get(node_id, [])])
        if direction in ("IN", "BOTH"):
            edges_to_scan.extend([(e, e.source_id) for e in self.in_edges.get(node_id, [])])

        for edge, neighbor_id in edges_to_scan:
            if relation_type is None or edge.relation_type == relation_type:
                neighbor_node = self.get_node(neighbor_id)
                if neighbor_node:
                    results.append((neighbor_node, edge))

        return results

    # =================================================================
    # SPATIAL & COMPETITOR INTELLIGENCE QUERIES
    # =================================================================

    def get_businesses_in_radius(
        self,
        center_lat: float,
        center_lon: float,
        radius_km: float,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Finds all business and competitor nodes within a catchment radius.
        Optionally filters by normalized category.
        """
        candidates = []
        target_cat = normalize_business_category(category) if category else None

        relevant_node_ids = set()
        if target_cat:
            relevant_node_ids = self.category_index.get(target_cat, set())
        else:
            relevant_node_ids = (
                self.nodes_by_type[EntityType.BUSINESS] | 
                self.nodes_by_type[EntityType.COMPETITOR]
            )

        for nid in relevant_node_ids:
            node = self.nodes.get(nid)
            if not node:
                continue
            
            lat = node.properties.get("latitude")
            lon = node.properties.get("longitude")
            if lat is not None and lon is not None:
                dist = haversine_distance(center_lat, center_lon, float(lat), float(lon))
                if dist <= radius_km:
                    candidates.append({
                        "node_id": node.node_id,
                        "name": node.name,
                        "category": node.properties.get("category", "General"),
                        "latitude": float(lat),
                        "longitude": float(lon),
                        "distance_km": dist,
                        "products_services": node.properties.get("products_services", []),
                        "provenance": node.provenance.model_dump()
                    })

        candidates.sort(key=lambda x: x["distance_km"])
        return candidates

    def query_competitors_within_radius(
        self,
        center_lat: float,
        center_lon: float,
        category: str,
        radius_km: float = 10.0
    ) -> Dict[str, Any]:
        """
        Executes comprehensive competitor query within 5km and 10km catchment.
        """
        norm_cat = normalize_business_category(category)
        within_5km = self.get_businesses_in_radius(center_lat, center_lon, min(5.0, radius_km), category=norm_cat)
        within_radius = self.get_businesses_in_radius(center_lat, center_lon, radius_km, category=norm_cat)

        nearest = within_radius[:5]  # Top 5 nearest

        return {
            "category": norm_cat,
            "center_lat": center_lat,
            "center_lon": center_lon,
            "radius_km": radius_km,
            "competitor_count_5km": len(within_5km),
            "competitor_count_radius": len(within_radius),
            "nearest_competitors": nearest,
            "nearest_distance_km": nearest[0]["distance_km"] if nearest else None
        }

    def query_category_density(
        self,
        center_lat: float,
        center_lon: float,
        radius_km: float = 10.0
    ) -> Dict[str, int]:
        """
        Calculates density distribution of all business categories within catchment.
        """
        all_nearby = self.get_businesses_in_radius(center_lat, center_lon, radius_km)
        category_counts: Dict[str, int] = defaultdict(int)

        for b in all_nearby:
            cat = normalize_business_category(b.get("category", "General"))
            category_counts[cat] += 1

        return dict(category_counts)

    def query_underserved_categories(
        self,
        center_lat: float,
        center_lon: float,
        radius_km: float = 10.0,
        benchmark_categories: Optional[List[str]] = None
    ) -> List[str]:
        """
        Identifies essential rural business categories that have 0 or very low local competitors.
        """
        from .normalization import CANONICAL_BUSINESS_CATEGORIES

        standard_categories = benchmark_categories or CANONICAL_BUSINESS_CATEGORIES
        present_densities = self.query_category_density(center_lat, center_lon, radius_km)

        underserved = []
        for cat in standard_categories:
            if present_densities.get(cat, 0) == 0:
                underserved.append(cat)

        return underserved

    def query_nearby_markets(
        self,
        center_lat: float,
        center_lon: float,
        radius_km: float = 20.0
    ) -> List[Dict[str, Any]]:
        """
        Retrieves commercial clusters, mandis, and haats within radius.
        """
        markets = []
        market_node_ids = self.nodes_by_type[EntityType.MARKET]

        for mid in market_node_ids:
            node = self.nodes.get(mid)
            if not node:
                continue
            lat = node.properties.get("latitude")
            lon = node.properties.get("longitude")
            if lat is not None and lon is not None:
                dist = haversine_distance(center_lat, center_lon, float(lat), float(lon))
                if dist <= radius_km:
                    markets.append({
                        "node_id": node.node_id,
                        "name": node.name,
                        "market_type": node.properties.get("market_type", "HAAT_MANDI"),
                        "distance_km": dist,
                        "latitude": float(lat),
                        "longitude": float(lon),
                        "operating_days": node.properties.get("operating_days", "DAILY"),
                        "provenance": node.provenance.model_dump()
                    })

        markets.sort(key=lambda x: x["distance_km"])
        return markets

    # =================================================================
    # SERIALIZATION / PERSISTENCE
    # =================================================================

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metadata": {
                "total_nodes": len(self.nodes),
                "total_edges": sum(len(e) for e in self.out_edges.values()),
                "exported_at": datetime.now(timezone.utc).isoformat()
            },
            "nodes": [n.to_dict() for n in self.nodes.values()],
            "edges": [e.to_dict() for edge_list in self.out_edges.values() for e in edge_list]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> VentureRootKnowledgeGraph:
        graph = cls()
        for node_data in data.get("nodes", []):
            graph.add_node(KGNode.from_dict(node_data))
        for edge_data in data.get("edges", []):
            graph.add_edge(KGEdge.from_dict(edge_data))
        return graph

    def save_to_file(self, file_path: str):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)

    @classmethod
    def load_from_file(cls, file_path: str) -> VentureRootKnowledgeGraph:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
