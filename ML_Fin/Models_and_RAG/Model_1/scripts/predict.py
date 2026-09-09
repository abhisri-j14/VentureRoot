"""
GramBiz Model 1 -- CLI Prediction Script
==========================================

Usage (Windows):
    .\.venv\Scripts\python.exe scripts\predict.py --state "West Bengal" --district "Bankura" --category "Dairy"
    .\.venv\Scripts\python.exe scripts\predict.py --state "Kerala" --district "Thrissur" --subdistrict "Chalakudy" --category "Retail"
"""

import argparse
import json
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)


def main():
    parser = argparse.ArgumentParser(description="GramBiz Model 1 Prediction")
    parser.add_argument("--state", type=str, required=True, help="State name")
    parser.add_argument("--district", type=str, required=True, help="District name")
    parser.add_argument("--subdistrict", type=str, default=None, help="Sub-district/block name")
    parser.add_argument("--village", type=str, default=None, help="Village name")
    parser.add_argument("--category", type=str, default="Dairy", help="Business category")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    from src.models.predict import GramBizPredictor

    predictor = GramBizPredictor()
    result = predictor.predict(
        state=args.state,
        district=args.district,
        subdistrict=args.subdistrict,
        village=args.village,
        business_category=args.category,
    )

    if args.json:
        print(json.dumps(result, indent=2, default=str))
        return

    # Formatted output
    print()
    print("=" * 60)
    print("GRAMBIZ MODEL 1 PREDICTION")
    print("=" * 60)
    print()

    loc = result.get("location", {})
    print(f"Business Category: {result.get('business_category', 'N/A')}")
    loc_str = ", ".join(filter(None, [
        loc.get("village"), loc.get("subdistrict"),
        loc.get("district"), loc.get("state"),
    ]))
    print(f"Location: {loc_str}")
    print()

    mpi = result.get("market_potential_score")
    if mpi is not None:
        print(f"Market Potential Score: {mpi:.1f}/100")
        print(f"Opportunity Level: {result.get('opportunity_level', 'N/A')}")
        print()

        # Component scores
        for key, label in [
            ("demand_score", "Demand Score"),
            ("purchasing_power_score", "Purchasing Power Score"),
            ("workforce_opportunity_score", "Workforce Opportunity"),
            ("infrastructure_score", "Infrastructure Score"),
            ("market_gap_score", "Market Gap Score"),
        ]:
            val = result.get(key)
            if val is not None:
                print(f"  {label}: {val:.1f}/100")

        print()
        print(f"Confidence: {result.get('confidence_score', 0):.1f}/100")
        print()

        # Positive factors
        positives = result.get("top_positive_factors", [])
        if positives:
            print("Top Positive Factors:")
            for i, f in enumerate(positives[:5], 1):
                factor = f.get("factor", "unknown")
                print(f"  {i}. {factor}")

        # Negative factors
        negatives = result.get("top_negative_factors", [])
        if negatives:
            print("\nPotential Concerns:")
            for i, f in enumerate(negatives[:5], 1):
                factor = f.get("factor", "unknown")
                print(f"  {i}. {factor}")

        # Data coverage
        coverage = result.get("data_coverage", {})
        print(f"\nData Coverage: {coverage.get('features_available', 0)}/{coverage.get('features_total', 0)} features ({coverage.get('coverage_pct', 0)}%)")
        print(f"Geographic Level: {result.get('geographic_level', 'N/A')}")
        print(f"Geospatial Radius: {'Available' if result.get('geospatial_radius_available') else 'Not Available'}")

    else:
        print("PREDICTION NOT AVAILABLE")
        print("Location not found in dataset.")

    # Warnings
    warnings = result.get("warnings", [])
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  - {w}")

    # Data freshness
    freshness = result.get("data_freshness", {})
    if freshness:
        print("\nData Freshness:")
        for k, v in freshness.items():
            print(f"  {k}: {v}")

    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
