"""
GramBiz Model 3 — Global Configuration & Constants
===================================================
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Environment variables
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")
METHODOLOGY_VERSION = os.getenv("METHODOLOGY_VERSION", "1.0.0")
FEATURE_VERSION = os.getenv("FEATURE_VERSION", "1.0.0")
API_PORT = int(os.getenv("MODEL3_PORT", 8003))

# Deterministic Seed
RANDOM_SEED = 42

# Directories
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
CACHED_DIR = DATA_DIR / "cached"
INTERIM_DIR = DATA_DIR / "interim"
PROCESSED_DIR = DATA_DIR / "processed"
EXTERNAL_DIR = DATA_DIR / "external"
METADATA_DIR = DATA_DIR / "metadata"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"
REPORTS_DIR = ARTIFACTS_DIR / "reports"
PLOTS_DIR = REPORTS_DIR / "plots"

# Ensure directories exist
for d in [DATA_DIR, RAW_DIR, CACHED_DIR, INTERIM_DIR, PROCESSED_DIR, EXTERNAL_DIR, METADATA_DIR, ARTIFACTS_DIR, MODELS_DIR, REPORTS_DIR, PLOTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Standard Price Unit
CANONICAL_PRICE_UNIT = "₹/quintal"
CANONICAL_CURRENCY = "INR"

# Supported Canonical Categories
SUPPORTED_COMMODITIES = [
    "Dairy", "Potato", "Onion", "Tomato", "Green Chilli", "Brinjal", "Cabbage", "Cauliflower",
    "Banana", "Garlic", "Ginger", "Apple", "Mango", "Rice", "Wheat", "Black Pepper"
]
