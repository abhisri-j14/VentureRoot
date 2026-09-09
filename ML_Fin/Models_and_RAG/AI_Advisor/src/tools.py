"""
External Service Tool Wrappers.
Wraps Model 1, Model 2, Model 3, Finance Engine, and RAG with strict Pydantic validation & fallback isolation.
"""

import time
import httpx
from typing import Dict, Any, Optional
from .config import settings
from .schemas import (
    Model1Result, Model2Result, Model3Result, FinanceResult, RAGResult, ToolExecutionResult
)

class ToolRunner:
    def __init__(self):
        self.settings = settings

    def call_model_1(self, location: str, district: str = "Purba Bardhaman", state: str = "West Bengal", business_category: str = "Dairy") -> ToolExecutionResult:
        """Call Model 1 (Hyper-Local Market Potential Engine)."""
        t0 = time.time()
        try:
            if self.settings.model_1_mode == "remote":
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(
                        f"{self.settings.model_1_url}/api/v1/model1/predict",
                        json={"subdistrict": location, "district": district, "state": state, "business_category": business_category}
                    )
                    resp.raise_for_status()
                    m1_res = resp.json()
            else:
                # Real local model execution
                from Model_1.src.models.predict import GramBizPredictor
                predictor = GramBizPredictor()
                m1_res = predictor.predict(
                    state=state,
                    district=district,
                    subdistrict=location,
                    business_category=business_category
                )

            data = {
                "location": location,
                "district": district,
                "potential_score": float(m1_res.get("market_potential_score", 0.0)),
                "tier": str(m1_res.get("opportunity_level", "Unknown")),
                "top_categories": [f.get("factor") if isinstance(f, dict) else str(f) for f in m1_res.get("top_positive_factors", [])[:3]] or ["Dairy", "Retail", "Agriculture"]
            }
            
            validated = Model1Result(**data)
            return ToolExecutionResult(
                tool_name="model_1",
                success=True,
                data=validated.model_dump(),
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
        except Exception as e:
            return ToolExecutionResult(
                tool_name="model_1",
                success=False,
                error=f"Model 1 Service Error: {str(e)}",
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )

    def call_model_2(self, business_type: str, location: str, district: str = "Purba Bardhaman", state: str = "West Bengal") -> ToolExecutionResult:
        """Call Model 2 (Business Viability & Competition Engine)."""
        t0 = time.time()
        try:
            if self.settings.model_2_mode == "remote":
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(
                        f"{self.settings.model_2_url}/api/v1/analyze",
                        json={"business_category": business_type, "subdistrict_name": location, "district_name": district, "state_name": state}
                    )
                    resp.raise_for_status()
                    m2_res = resp.json()
            else:
                # Real local model execution
                from Model_2.src.models.predict import Model2InferenceEngine
                engine = Model2InferenceEngine()
                m2_res = engine.analyze_location(
                    state_name=state,
                    district_name=district,
                    subdistrict_name=location,
                    business_category=business_type
                )

            cat_details = m2_res.get("selected_category_analysis") or {}
            data = {
                "business_type": business_type,
                "viability_score": float(m2_res.get("overall_viability_score") or 0.0),
                "competition_level": str(cat_details.get("competition_score", "Moderate")),
                "market_gap_score": float(cat_details.get("demand_proxy_score", 50.0)),
                "risk_level": str(m2_res.get("score_band", "Moderate"))
            }
            
            validated = Model2Result(**data)
            return ToolExecutionResult(
                tool_name="model_2",
                success=True,
                data=validated.model_dump(),
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
        except Exception as e:
            return ToolExecutionResult(
                tool_name="model_2",
                success=False,
                error=f"Model 2 Service Error: {str(e)}",
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )

    def call_model_3(self, commodity: str = "Mustard", location: str = "Bhatar", district: str = "Purba Bardhaman", state: str = "West Bengal") -> ToolExecutionResult:
        """Call Model 3 (Local Market Price Prediction Engine)."""
        t0 = time.time()
        try:
            if self.settings.model_3_mode == "remote":
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(f"{self.settings.model_3_url}/api/v1/predict", json={"commodity": commodity, "location": location})
                    resp.raise_for_status()
                    data = resp.json()
            else:
                # Real local model execution
                from Model_3.src.inference.engine import Model3InferenceEngine
                engine = Model3InferenceEngine()
                m3_res = engine.predict(
                    state=state,
                    district=district,
                    market=location,
                    commodity=commodity
                )
                pred_price = m3_res.get("predicted_price", 0.0)
                int_bounds = m3_res.get("prediction_interval", {})
                data = {
                    "commodity": commodity,
                    "location": location,
                    "predicted_price_per_quintal": round(float(pred_price), 2),
                    "lower_bound_90": round(float(int_bounds.get("lower", pred_price * 0.85)), 2),
                    "upper_bound_90": round(float(int_bounds.get("upper", pred_price * 1.15)), 2),
                    "reference_retail_price_per_kg": round(float(m3_res.get("reference_selling_price", pred_price / 100.0)), 2),
                    "unit": "quintal"
                }
            
            validated = Model3Result(**data)
            return ToolExecutionResult(
                tool_name="model_3",
                success=True,
                data=validated.model_dump(),
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
        except Exception as e:
            return ToolExecutionResult(
                tool_name="model_3",
                success=False,
                error=f"Model 3 Service Error: {str(e)}",
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )

    def call_finance_engine(self, project_cost: float, own_margin: float = 100000.0) -> ToolExecutionResult:
        """Call Authoritative SIH Finance Engine."""
        t0 = time.time()
        try:
            if self.settings.finance_engine_mode == "remote":
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(f"{self.settings.finance_engine_url}/api/v1/calculate", json={"project_cost": project_cost, "own_margin": own_margin})
                    resp.raise_for_status()
                    data = resp.json()
            else:
                # Authoritative SIH deterministic calculation
                margin = float(own_margin)
                calc_project_cost = margin / 0.10 if margin > 0 else float(project_cost)
                if calc_project_cost <= 140000.0:
                    rate = 0.065
                    tenure = 36
                    moratorium = 3
                    cap = 125000.0
                elif calc_project_cost <= 5000000.0:
                    rate = 0.080
                    tenure = 84
                    moratorium = 6
                    cap = 4500000.0
                else:
                    rate = 0.080
                    tenure = 84
                    moratorium = 6
                    cap = 4500000.0

                loan = min(calc_project_cost * 0.90, cap)
                promoter_contrib = calc_project_cost - loan
                monthly_rate = rate / 12.0

                # Compound moratorium capitalization
                p_eff = loan
                for _ in range(moratorium):
                    p_eff = round(p_eff + (p_eff * monthly_rate), 2)

                repay_months = tenure - moratorium
                factor = ((1.0 + monthly_rate) ** repay_months)
                emi = (p_eff * monthly_rate * factor) / (factor - 1.0) if factor > 1.0 else 0.0
                
                data = {
                    "project_cost": round(calc_project_cost, 2),
                    "promoter_contribution": round(promoter_contrib, 2),
                    "subsidy_amount": 0.0,
                    "eligible_loan_amount": round(loan, 2),
                    "interest_rate_pct": rate * 100.0,
                    "tenure_months": tenure,
                    "monthly_emi": round(emi, 2),
                    "break_even_months": moratorium + 6
                }
            
            validated = FinanceResult(**data)
            return ToolExecutionResult(
                tool_name="finance_engine",
                success=True,
                data=validated.model_dump(),
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
        except Exception as e:
            return ToolExecutionResult(
                tool_name="finance_engine",
                success=False,
                error=f"Finance Engine Service Error: {str(e)}",
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )

    def call_rag(self, query: str, top_k: int = 5) -> ToolExecutionResult:
        """Call RAG Knowledge System."""
        t0 = time.time()
        try:
            if self.settings.rag_mode == "remote":
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(f"{self.settings.rag_url}/api/v1/query", json={"query": query, "top_k": top_k})
                    resp.raise_for_status()
                    data = resp.json()
            else:
                import sys
                from pathlib import Path
                models_rag_dir = str(Path(__file__).resolve().parent.parent.parent)
                if models_rag_dir not in sys.path:
                    sys.path.insert(0, models_rag_dir)
                from RAG.src.pipeline import RAGPipeline
                pipe = RAGPipeline()
                data = pipe.query(query, top_k=top_k)

            validated = RAGResult(**data)
            return ToolExecutionResult(
                tool_name="rag",
                success=True,
                data=validated.model_dump(),
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
        except Exception as e:
            return ToolExecutionResult(
                tool_name="rag",
                success=False,
                error=f"RAG Service Error: {str(e)}",
                latency_ms=round((time.time() - t0) * 1000.0, 2)
            )
