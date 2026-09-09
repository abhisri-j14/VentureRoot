"""
GramBiz Model 3 — FastAPI Dependencies
=======================================
Provides singleton instance of Model3InferenceEngine.
"""

from src.inference.engine import Model3InferenceEngine
from src.utils.logger import get_logger

logger = get_logger("APIDependencies")

_engine_instance = None


def get_inference_engine() -> Model3InferenceEngine:
    global _engine_instance
    if _engine_instance is None:
        logger.info("Instantiating Model 3 Inference Engine for FastAPI...")
        _engine_instance = Model3InferenceEngine()
    return _engine_instance
