"""
Tool Failure Isolation Module.
Ensures partial service degradation does not crash the AI Advisor architecture.
"""

from typing import Dict, Any, List
from ..schemas import ToolExecutionResult

class ToolFailureIsolator:
    def process_tool_results(
        self,
        results: List[ToolExecutionResult]
    ) -> Dict[str, Any]:
        """
        Synthesize tool outputs into usable data map and list warning notices for failed services.
        """
        data_map: Dict[str, Dict[str, Any]] = {}
        warnings: List[str] = []

        for res in results:
            if res.success and res.data:
                data_map[res.tool_name] = res.data
            else:
                service_names = {
                    "model_1": "Market Potential Scoring Engine (Model 1)",
                    "model_2": "Business Viability & Competition Engine (Model 2)",
                    "model_3": "Local Market Price Prediction Engine (Model 3)",
                    "finance_engine": "Financial Calculation Engine",
                    "rag": "Government Scheme RAG Verification Service"
                }
                display_name = service_names.get(res.tool_name, res.tool_name)
                warnings.append(f"{display_name} is currently unavailable. Advice generated using available services.")

        return {
            "data_map": data_map,
            "warnings": warnings,
            "has_failures": len(warnings) > 0
        }
