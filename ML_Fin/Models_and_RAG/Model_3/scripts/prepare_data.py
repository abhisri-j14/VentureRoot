"""
GramBiz Model 3 — Standalone Data Preparation CLI
Runs cleaning, unit normalization, geographic normalization, and feature engineering.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data.cleaning import run_cleaning_pipeline
from src.features.engineering import run_feature_pipeline

if __name__ == "__main__":
    run_cleaning_pipeline()
    run_feature_pipeline()
