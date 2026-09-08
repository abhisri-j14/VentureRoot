"""
Root Environment & AI Advisor Configuration Governance Module.
Loads environment variables from F:\\AI Business Advisor\\.env or OS environment.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field

ADVISOR_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = ADVISOR_DIR.parent.parent
ENV_FILE = ROOT_DIR / ".env"

def load_root_env():
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip("'").strip('"')
                if k and k not in os.environ:
                    os.environ[k] = v

load_root_env()

class AdvisorSettings(BaseModel):
    advisor_host: str = Field(default_factory=lambda: os.getenv("AI_ADVISOR_HOST", "127.0.0.1"))
    advisor_port: int = Field(default_factory=lambda: int(os.getenv("AI_ADVISOR_PORT", "8005")))
    
    max_tool_calls: int = Field(default_factory=lambda: int(os.getenv("MAX_TOOL_CALLS_PER_REQUEST", "10")))
    
    # Secrets
    gemini_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", None))
    gemini_model: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    
    # External Service URLs / Modes
    model_1_mode: str = Field(default_factory=lambda: os.getenv("MODEL_1_MODE", "local"))
    model_1_url: str = Field(default_factory=lambda: os.getenv("MODEL_1_API_URL", "http://127.0.0.1:8001"))
    
    model_2_mode: str = Field(default_factory=lambda: os.getenv("MODEL_2_MODE", "local"))
    model_2_url: str = Field(default_factory=lambda: os.getenv("MODEL_2_API_URL", "http://127.0.0.1:8002"))
    
    model_3_mode: str = Field(default_factory=lambda: os.getenv("MODEL_3_MODE", "local"))
    model_3_url: str = Field(default_factory=lambda: os.getenv("MODEL_3_API_URL", "http://127.0.0.1:8003"))
    
    finance_engine_mode: str = Field(default_factory=lambda: os.getenv("FINANCE_ENGINE_MODE", "local"))
    finance_engine_url: str = Field(default_factory=lambda: os.getenv("FINANCE_ENGINE_API_URL", "http://127.0.0.1:8006"))
    
    rag_mode: str = Field(default_factory=lambda: os.getenv("RAG_MODE", "local"))
    rag_url: str = Field(default_factory=lambda: os.getenv("RAG_API_URL", "http://127.0.0.1:8004"))
    
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    redact_secrets: bool = Field(default_factory=lambda: os.getenv("REDACT_SECRETS_IN_LOGS", "true").lower() == "true")

settings = AdvisorSettings()
