"""
GramBiz Model 3 — Single Price Prediction CLI
"""

import sys
import json
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.inference.engine import Model3InferenceEngine


def main():
    parser = argparse.ArgumentParser(description="GramBiz Model 3 CLI Predictor")
    parser.add_argument("--state", type=str, default="West Bengal")
    parser.add_argument("--district", type=str, default="Bankura")
    parser.add_argument("--market", type=str, default="Bankura APMC")
    parser.add_argument("--commodity", type=str, default="Potato")
    parser.add_argument("--recent-price", type=float, default=2200.0)
    args = parser.parse_args()

    engine = Model3InferenceEngine()
    res = engine.predict(
        state=args.state,
        district=args.district,
        market=args.market,
        commodity=args.commodity,
        recent_observed_price=args.recent_price
    )
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
