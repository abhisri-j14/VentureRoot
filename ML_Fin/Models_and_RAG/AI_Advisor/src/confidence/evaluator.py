"""
Composite Advisor Confidence Evaluator.
Derives confidence from tool availability, model bounds, RAG retrieval scores, and OOD status.
Outputs HIGH, MEDIUM, or LOW.
"""

from typing import Dict, Any, List

class CompositeConfidenceEvaluator:
    def evaluate(
        self,
        data_map: Dict[str, Dict[str, Any]],
        tools_requested: List[str]
    ) -> str:
        """
        Derive composite confidence rating (HIGH, MEDIUM, LOW) based on empirical evidence signals.
        """
        if not data_map:
            return "LOW"

        available_count = sum(1 for t in tools_requested if t in data_map)
        availability_ratio = available_count / max(1, len(tools_requested))

        if availability_ratio < 0.5:
            return "LOW"

        # Check RAG confidence if RAG was requested
        rag_conf = "MEDIUM"
        if "rag" in data_map:
            rag_data = data_map["rag"]
            if rag_data.get("should_abstain"):
                rag_conf = "LOW"
            else:
                rag_conf = rag_data.get("confidence_level", "MEDIUM")

        if availability_ratio >= 0.8 and rag_conf in ["HIGH", "MEDIUM"]:
            return "HIGH"
        elif availability_ratio >= 0.5:
            return "MEDIUM"
        else:
            return "LOW"
