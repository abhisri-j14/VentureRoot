"""
GramBiz Model 3 — Standalone Leakage Audit CLI
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.features.leakage_audit import run_audit_script

if __name__ == "__main__":
    run_audit_script()
