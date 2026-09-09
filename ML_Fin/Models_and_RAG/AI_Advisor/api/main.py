"""
FastAPI Microservice for GramBiz Gemini AI Advisory Agent.
Exposes /health, /api/v1/health, and /api/v1/advise endpoints.
Runs on Port 8005.
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ADVISOR_DIR = Path(__file__).resolve().parent.parent
ML_FIN_DIR = ADVISOR_DIR.parent.parent
sys.path.insert(0, str(ADVISOR_DIR))
if str(ML_FIN_DIR) not in sys.path:
    sys.path.insert(0, str(ML_FIN_DIR))

from src.agent import GramBizAdvisorAgent
from src.schemas import AdvisoryRequest
from src.config import settings
from common.backend_client import fetch_business_by_id

app = FastAPI(
    title="GramBiz AI Advisory Agent Microservice",
    description="Orchestrated Hyper-Local Advisory Service using ML Engines, Finance Engine & RAG",
    version="1.0.0"
)

agent = GramBizAdvisorAgent()

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Health check exposing service status and dependency health."""
    return {
        "status": "HEALTHY",
        "service": "GramBiz Gemini AI Advisory Agent",
        "version": "1.0.0",
        "advisor_port": settings.advisor_port,
        "dependencies": {
            "model_1": settings.model_1_mode,
            "model_2": settings.model_2_mode,
            "model_3": settings.model_3_mode,
            "finance_engine": settings.finance_engine_mode,
            "rag": settings.rag_mode,
            "gemini": "configured" if settings.gemini_api_key else "local_fallback"
        }
    }

@app.post("/api/v1/advise")
def get_advisory(req: AdvisoryRequest):
    """Generate comprehensive hyper-local business advisory report."""
    try:
        if req.business_id:
            biz = fetch_business_by_id(req.business_id)
            if biz:
                req.location = f"{biz.get('district', '')}, {biz.get('state', '')}".strip(", ") or req.location
                req.district = biz.get("district") or req.district
                req.proposed_business = biz.get("category_name") or req.proposed_business
                margin = float(biz.get("available_margin") or 100000.0)
                req.own_margin = margin
                req.investment_amount = margin * 5.0

        res = agent.process_request(req)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.advisor_host, port=settings.advisor_port)
