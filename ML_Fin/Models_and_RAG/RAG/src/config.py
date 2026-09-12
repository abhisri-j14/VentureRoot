"""
Root Environment & RAG Configuration Governance Module.
Loads environment variables from F:\\AI Business Advisor\\.env or OS environment.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field

# Locate root directory
RAG_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = RAG_DIR.parent.parent
ENV_FILE = ROOT_DIR / ".env"

def load_root_env():
    """Load key-value pairs from root .env if present without overwriting set env vars."""
    candidate_envs = [ROOT_DIR / ".env", ROOT_DIR.parent / ".env"]
    for env_path in candidate_envs:
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'").strip('"')
                    if k and k not in os.environ:
                        os.environ[k] = v

load_root_env()


class RAGSettings(BaseModel):
    # Core RAG Config
    rag_mode: str = Field(default_factory=lambda: os.getenv("RAG_MODE", "local"))
    rag_api_host: str = Field(default="127.0.0.1")
    rag_api_port: int = Field(default=8004)
    
    # Paths
    documents_dir: Path = Field(default_factory=lambda: RAG_DIR / "documents")
    data_dir: Path = Field(default_factory=lambda: RAG_DIR / "data")
    processed_dir: Path = Field(default_factory=lambda: RAG_DIR / "processed")
    embeddings_dir: Path = Field(default_factory=lambda: RAG_DIR / "embeddings")
    artifacts_dir: Path = Field(default_factory=lambda: RAG_DIR / "artifacts")
    vector_store_path: Path = Field(default_factory=lambda: RAG_DIR / "embeddings" / "vector_store.pkl")
    
    # Ingestion & Chunking
    chunk_size: int = Field(default_factory=lambda: int(os.getenv("RAG_CHUNK_SIZE", "500")))
    chunk_overlap: int = Field(default_factory=lambda: int(os.getenv("RAG_CHUNK_OVERLAP", "50")))
    min_chunk_len: int = Field(default_factory=lambda: int(os.getenv("RAG_MIN_CHUNK_LEN", "30")))
    
    # Embeddings & Vector Store
    embedding_provider: str = Field(default_factory=lambda: os.getenv("RAG_EMBEDDING_PROVIDER", "local_tfidf"))
    embedding_dim: int = Field(default=300)
    
    # Retrieval
    top_k: int = Field(default_factory=lambda: int(os.getenv("RAG_TOP_K", "5")))
    similarity_threshold: float = Field(default_factory=lambda: float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.15")))
    dense_weight: float = Field(default=0.6)
    sparse_weight: float = Field(default=0.4)
    
    # Secrets (Loaded from Env)
    gemini_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", None))
    data_gov_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("DATA_GOV_API_KEY", None))
    
    # Governance & Logging
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    redact_secrets: bool = Field(default_factory=lambda: os.getenv("REDACT_SECRETS_IN_LOGS", "true").lower() == "true")

    def ensure_directories(self):
        """Create necessary workspace directories if they do not exist."""
        for d in [self.documents_dir, self.data_dir, self.processed_dir, self.embeddings_dir, self.artifacts_dir, self.artifacts_dir / "reports"]:
            d.mkdir(parents=True, exist_ok=True)

settings = RAGSettings()
settings.ensure_directories()
