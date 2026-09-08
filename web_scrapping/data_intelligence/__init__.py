"""
VentureRoot Hyper-Local Data Intelligence Layer
===============================================
"""

from .authority import (
    AuthorityLevel,
    ConfidenceStatus,
    DataProvenance,
    FreshnessStatus
)
from .config import settings
from .geo import (
    bounding_box,
    estimate_population_in_radius,
    filter_within_radius,
    haversine_distance,
    validate_coordinates
)
from .normalization import (
    CANONICAL_BUSINESS_CATEGORIES,
    clean_text_string,
    normalize_business_category,
    normalize_commodity_name,
    normalize_state_name,
    validate_and_normalize_coordinates
)
from .schemas import (
    CompetitorRecord,
    CustomerType,
    DemographicProfile,
    MarketCluster,
    MarketReachResult,
    OpportunityAnalysisResult,
    OpportunityLevel,
    ProductValuationResult,
    StructuredWarning,
    ThreatAnalysisResult,
    ThreatLevel,
    UserInputData,
    WarningCode
)
from .knowledge_graph import (
    EntityType,
    KGEdge,
    KGNode,
    RelationType,
    VentureRootKnowledgeGraph
)
from .competitor import CompetitorIntelligenceEngine
from .opportunity import OpportunityAnalysisEngine
from .threat import ThreatAnalysisEngine
from .valuation import ProductValuationEngine
from .feature_contract import (
    FORBIDDEN_LEAKAGE_FIELDS,
    LeakageRiskLevel,
    MODEL_1_FEATURE_CONTRACT,
    MODEL_2_FEATURE_CONTRACT,
    MODEL_3_FEATURE_CONTRACT,
    validate_feature_contract
)
from .freshness import assess_freshness
from .cache import CacheManager, default_cache
from .resilience import SystemResilienceManager
from .security import (
    quarantine_as_inert_data,
    redact_secrets_for_logging,
    sanitize_untrusted_text,
    scan_for_prompt_injection
)
from .orchestrator import HyperLocalOrchestrator

__all__ = [
    "AuthorityLevel",
    "ConfidenceStatus",
    "DataProvenance",
    "FreshnessStatus",
    "settings",
    "haversine_distance",
    "bounding_box",
    "filter_within_radius",
    "estimate_population_in_radius",
    "validate_coordinates",
    "normalize_state_name",
    "normalize_business_category",
    "normalize_commodity_name",
    "clean_text_string",
    "validate_and_normalize_coordinates",
    "CANONICAL_BUSINESS_CATEGORIES",
    "UserInputData",
    "DemographicProfile",
    "CompetitorRecord",
    "MarketCluster",
    "MarketReachResult",
    "OpportunityAnalysisResult",
    "ThreatAnalysisResult",
    "ProductValuationResult",
    "StructuredWarning",
    "WarningCode",
    "CustomerType",
    "OpportunityLevel",
    "ThreatLevel",
    "EntityType",
    "RelationType",
    "KGNode",
    "KGEdge",
    "VentureRootKnowledgeGraph",
    "CompetitorIntelligenceEngine",
    "OpportunityAnalysisEngine",
    "ThreatAnalysisEngine",
    "ProductValuationEngine",
    "MODEL_1_FEATURE_CONTRACT",
    "MODEL_2_FEATURE_CONTRACT",
    "MODEL_3_FEATURE_CONTRACT",
    "FORBIDDEN_LEAKAGE_FIELDS",
    "LeakageRiskLevel",
    "validate_feature_contract",
    "assess_freshness",
    "CacheManager",
    "default_cache",
    "SystemResilienceManager",
    "sanitize_untrusted_text",
    "scan_for_prompt_injection",
    "quarantine_as_inert_data",
    "redact_secrets_for_logging",
    "HyperLocalOrchestrator",
    "VentureRootStep3Pipeline",
    "VentureRootStep4Pipeline",
    "IntegratedStep3Result",
    "IntegratedStep4Result",
    "UserBusinessInput"
]

from .schemas import (
    UserBusinessInput,
    IntegratedStep3Result,
    IntegratedStep4Result,
    RAGEvidenceResult,
    RAGCitation,
    AdvisorySynthesis,
    AdvisorySWOT,
    NumericalIntegrityStatus
)
from .pipeline import VentureRootPipeline, VentureRootStep3Pipeline, VentureRootStep4Pipeline
from .adapters import (
    Model1Adapter,
    Model2Adapter,
    Model3Adapter,
    FinanceEngineAdapter,
    RAGAdapter,
    Step4NumericalFirewall,
    GeminiAdvisorClient,
)

