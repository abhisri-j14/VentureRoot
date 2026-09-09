"""
GramBiz Model 3 — Standalone Model Training CLI
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.models.train import run_pipeline

if __name__ == "__main__":
    run_pipeline()
