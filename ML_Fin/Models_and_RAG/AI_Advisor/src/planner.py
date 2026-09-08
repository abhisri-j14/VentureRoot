"""
Intent Planner Module.
Analyzes user query and produces an auditable execution plan selecting necessary tools.
"""

from typing import List, Dict, Any
from .schemas import AgentPlan

class IntentPlanner:
    def plan(self, user_query: str) -> AgentPlan:
        """Analyze query string and produce structured AgentPlan."""
        q_lower = user_query.lower()

        tools: List[str] = []
        reason_parts: List[str] = []

        is_price_query = any(k in q_lower for k in ["price", "cost per quintal", "rate", "potato price", "market price"])
        is_scheme_query = any(k in q_lower for k in ["scheme", "subsidy", "government", "pmegp", "mudra", "apmc", "license", "grant"])
        is_finance_query = any(k in q_lower for k in ["finance", "loan", "emi", "afford", "margin", "capital", "interest", "bank loan"])
        is_business_opportunity = any(k in q_lower for k in ["business", "start", "opportunity", "viability", "potential", "bankura", "location"])

        if is_price_query and not is_business_opportunity and not is_finance_query and not is_scheme_query:
            tools = ["model_3"]
            reason_parts.append("Query requests local market price prediction.")
        elif is_scheme_query and not is_business_opportunity and not is_finance_query and not is_price_query:
            tools = ["rag"]
            reason_parts.append("Query requests government scheme or regulatory information.")
        elif is_finance_query:
            tools = ["model_1", "model_2", "model_3", "finance_engine", "rag"]
            reason_parts.append("Query involves financial feasibility, requiring ML models, Finance Engine, and RAG.")
        else:
            # Default comprehensive advisory plan
            tools = ["model_1", "model_2", "model_3", "rag"]
            if is_finance_query or "loan" in q_lower or "lakh" in q_lower:
                tools.append("finance_engine")
            reason_parts.append("Query requires comprehensive hyper-local business viability, market price, and scheme assessment.")

        return AgentPlan(
            user_intent=user_query,
            tools_required=tools,
            planning_reason=" ".join(reason_parts)
        )
