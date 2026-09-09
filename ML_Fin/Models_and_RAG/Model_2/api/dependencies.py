"""
GramBiz Model 2 -- FastAPI Dependencies
=========================================
Provides singleton instance of Model2InferenceEngine for route handlers.
"""

from src.models.predict import Model2InferenceEngine

_engine_instance = None


def get_inference_engine() -> Model2InferenceEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = Model2InferenceEngine()
    return _engine_instance
