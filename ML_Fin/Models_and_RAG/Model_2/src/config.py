"""
GramBiz Model 2 -- Environment Configuration
===============================================
Central configuration for Model 2 paths, random seed, target weights,
API ports, and external integration URLs.
"""

import os

# ── Base Directory ──────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ── Directories ─────────────────────────────────────────────────────
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
INTERIM_DATA_DIR = os.path.join(DATA_DIR, "interim")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
EXTERNAL_DATA_DIR = os.path.join(DATA_DIR, "external")

ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
MODELS_DIR = os.path.join(ARTIFACTS_DIR, "models")
METRICS_DIR = os.path.join(ARTIFACTS_DIR, "metrics")
FEATURE_METADATA_DIR = os.path.join(ARTIFACTS_DIR, "feature_metadata")
REPORTS_DIR = os.path.join(ARTIFACTS_DIR, "reports")
PLOTS_DIR = os.path.join(REPORTS_DIR, "plots")

# ── Reproducibility & Versions ──────────────────────────────────────
RANDOM_SEED = 42
MODEL_VERSION = "1.0.0"
METHODOLOGY_VERSION = "1.0.0"
FEATURE_VERSION = "1.0.0"
TAXONOMY_VERSION = "1.0.0"

# ── Integration URLs ────────────────────────────────────────────────
MODEL1_API_URL = os.getenv("MODEL1_API_URL", "https://grambiz-model1-engine.onrender.com")
FINANCE_ENGINE_URL = os.getenv("FINANCE_ENGINE_URL", "https://grambiz-finance-engine.onrender.com")

# ── API Server ──────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("MODEL2_PORT", 8002))

# ── Canonical Business Taxonomy (15 Categories) ─────────────────────
CANONICAL_CATEGORIES = [
    "Dairy",
    "Retail",
    "Textiles",
    "Food Processing",
    "Agriculture",
    "Fisheries",
    "Poultry",
    "Handicrafts",
    "Manufacturing",
    "Services",
    "Repair/Maintenance",
    "Transport",
    "Hospitality",
    "Personal Services",
    "Other"
]

# Ensure directories exist
for d in [DATA_DIR, RAW_DATA_DIR, INTERIM_DATA_DIR, PROCESSED_DATA_DIR, EXTERNAL_DATA_DIR,
          ARTIFACTS_DIR, MODELS_DIR, METRICS_DIR, FEATURE_METADATA_DIR, REPORTS_DIR, PLOTS_DIR]:
    os.makedirs(d, exist_ok=True)
