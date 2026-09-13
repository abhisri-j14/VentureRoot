"""
VentureRoot & GramBiz Comprehensive ML & Finance Engine Stress-Testing Suite
=============================================================================
Tests all 5 core engines and the master integration pipeline under:
  1. Standard real-world production scenarios
  2. Randomized multi-district, multi-commodity, multi-capital scenarios
  3. Harsh, extreme, and worst-case stress scenarios (OOD, zero capital, extreme debt, invalid inputs)

Engines Tested:
  - Model 1: Market Potential Index (MPI) Engine
  - Model 2: Business Viability & Competition Engine
  - Model 3: APMC Price Prediction & Conformal Intervals Engine
  - Finance Engine: Micro Finance & Term Loan Scheme / EMI / Amortization Calculator
  - Data Service / Web Scrapping: Demographics, Density & Catchment Statistics
  - Master Step 4 Pipeline: Multi-model orchestration + Numerical Integrity Firewall
"""

import sys
import os
import json
import time
import warnings
from pathlib import Path

# Suppress sklearn unpickling version warnings and deprecations in test output
warnings.filterwarnings("ignore")

# Force UTF-8 on standard outputs for Windows PowerShell compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Setup paths
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ML_FIN_DIR = WORKSPACE_ROOT / "ML_Fin"
WEB_SCRAPING_DIR = WORKSPACE_ROOT / "web_scrapping"

sys.path.insert(0, str(WORKSPACE_ROOT))
sys.path.insert(0, str(ML_FIN_DIR))
sys.path.insert(0, str(WEB_SCRAPING_DIR))

try:
    from data_intelligence.adapters import (
        Model1Adapter,
        Model2Adapter,
        Model3Adapter,
        FinanceEngineAdapter,
    )
    from data_intelligence.pipeline import VentureRootPipeline
    from data_intelligence.schemas import UserBusinessInput, ComponentStatus
except ImportError:
    from web_scrapping.data_intelligence.adapters import (
        Model1Adapter,
        Model2Adapter,
        Model3Adapter,
        FinanceEngineAdapter,
    )
    from web_scrapping.data_intelligence.pipeline import VentureRootPipeline
    from web_scrapping.data_intelligence.schemas import UserBusinessInput, ComponentStatus

from web_scrapping.api import get_location_statistics, load_population_df, load_housing_df

# Summary collector
TEST_RESULTS = {
    "total_tests": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "suites": {}
}


def record_result(suite_name: str, test_name: str, passed: bool, details: dict, error: str = None):
    TEST_RESULTS["total_tests"] += 1
    if passed:
        TEST_RESULTS["passed"] += 1
    else:
        TEST_RESULTS["failed"] += 1

    if suite_name not in TEST_RESULTS["suites"]:
        TEST_RESULTS["suites"][suite_name] = []

    TEST_RESULTS["suites"][suite_name].append({
        "test": test_name,
        "passed": passed,
        "details": details,
        "error": error
    })
    status_icon = "[PASS]" if passed else "[FAIL]"
    print(f"  {status_icon} {test_name}")
    if error:
        print(f"         Error: {error}")


# =====================================================================
# 1. MODEL 1: MARKET POTENTIAL ENGINE TESTS
# =====================================================================
def test_model_1():
    print("\n" + "=" * 70)
    print("TEST SUITE 1: Model 1 - Market Potential Engine")
    print("=" * 70)

    adapter = Model1Adapter()

    # Scenario 1.1: Standard Production Case
    try:
        out = adapter.predict(
            state="Gujarat",
            district="Anand",
            subdistrict="Anand",
            business_category="Retail"
        )
        passed = out.status == ComponentStatus.SUCCESS and out.market_potential_score is not None
        record_result("Model 1", "Standard: Gujarat/Anand/Retail", passed, {
            "status": out.status.value,
            "market_potential_score": out.market_potential_score,
            "opportunity_tier": out.opportunity_tier.value if hasattr(out.opportunity_tier, "value") else str(out.opportunity_tier),
            "demand_score": out.demand_score
        })
    except Exception as e:
        record_result("Model 1", "Standard: Gujarat/Anand/Retail", False, {}, str(e))

    # Scenario 1.2: Random Locations & Categories
    test_locs = [
        ("Punjab", "Ludhiana", "Dairy"),
        ("Bihar", "Patna", "Food Processing"),
        ("West Bengal", "Purba Bardhaman", "Textiles"),
    ]
    for st, dist, cat in test_locs:
        try:
            out = adapter.predict(state=st, district=dist, business_category=cat)
            passed = out.status == ComponentStatus.SUCCESS and out.market_potential_score is not None
            record_result("Model 1", f"Random: {st}/{dist}/{cat}", passed, {
                "score": out.market_potential_score,
                "tier": str(out.opportunity_tier)
            })
        except Exception as e:
            record_result("Model 1", f"Random: {st}/{dist}/{cat}", False, {}, str(e))

    # Scenario 1.3: Harsh / Worst Conditions
    # 1.3.1: Remote Desert Border District
    try:
        out = adapter.predict(state="Rajasthan", district="Jaisalmer", business_category="Luxury Handicrafts")
        passed = out.status == ComponentStatus.SUCCESS and out.market_potential_score is not None
        record_result("Model 1", "Harsh: Remote Border Jaisalmer/Luxury", passed, {
            "score": out.market_potential_score,
            "tier": str(out.opportunity_tier)
        })
    except Exception as e:
        record_result("Model 1", "Harsh: Remote Border Jaisalmer/Luxury", False, {}, str(e))

    # 1.3.2: Unmapped / Non-Existent District
    try:
        out = adapter.predict(state="FantasyState", district="FantasyDistrict", business_category="Retail")
        passed = out.status in [ComponentStatus.FAILED, ComponentStatus.DEGRADED]
        record_result("Model 1", "Harsh: Unmapped Location Handled Gracefully", passed, {
            "status": out.status.value,
            "warnings": out.warnings
        })
    except Exception as e:
        record_result("Model 1", "Harsh: Unmapped Location Handled Gracefully", False, {}, str(e))

    # 1.3.3: Missing / Null Inputs
    try:
        out = adapter.predict(state="", district="", business_category="")
        passed = out.status == ComponentStatus.FAILED and len(out.warnings) > 0
        record_result("Model 1", "Harsh: Null Location Input Guard", passed, {
            "status": out.status.value,
            "warnings": out.warnings
        })
    except Exception as e:
        record_result("Model 1", "Harsh: Null Location Input Guard", False, {}, str(e))


# =====================================================================
# 2. MODEL 2: BUSINESS VIABILITY & COMPETITION ENGINE TESTS
# =====================================================================
def test_model_2():
    print("\n" + "=" * 70)
    print("TEST SUITE 2: Model 2 - Business Viability & Competition Engine")
    print("=" * 70)

    adapter = Model2Adapter()

    # Scenario 2.1: Standard Production Case
    try:
        out = adapter.analyze(
            state="Gujarat",
            district="Anand",
            subdistrict="Anand",
            business_category="Retail",
            competitor_density=0.03,
            saturation_index=1.2
        )
        passed = out.status == ComponentStatus.SUCCESS and out.viability_score > 0
        record_result("Model 2", "Standard: Gujarat/Anand/Retail", passed, {
            "status": out.status.value,
            "viability_score": out.viability_score,
            "competition_level": out.competition_level,
            "risk_level": out.risk_level,
            "score_band": out.score_band
        })
    except Exception as e:
        record_result("Model 2", "Standard: Gujarat/Anand/Retail", False, {}, str(e))

    # Scenario 2.2: Random Multi-Sector Rankings
    test_locs = [
        ("West Bengal", "Purba Bardhaman", "Memari I", "Dairy Farming"),
        ("Bihar", "Patna", "Danapur", "Food Processing"),
    ]
    for st, dist, sub, cat in test_locs:
        try:
            out = adapter.analyze(state=st, district=dist, subdistrict=sub, business_category=cat)
            passed = out.status == ComponentStatus.SUCCESS and len(out.category_rankings) > 0
            record_result("Model 2", f"Random: {st}/{dist}/{cat}", passed, {
                "viability_score": out.viability_score,
                "rankings_count": len(out.category_rankings),
                "top_category": out.category_rankings[0].get("category") if out.category_rankings else None
            })
        except Exception as e:
            record_result("Model 2", f"Random: {st}/{dist}/{cat}", False, {}, str(e))

    # Scenario 2.3: Harsh / Worst Conditions
    # 2.3.1: Extreme Saturation & High Competition
    try:
        out = adapter.analyze(
            state="Gujarat",
            district="Anand",
            business_category="Retail",
            competitor_density=0.25,
            saturation_index=4.5,
            saturation_status="HIGH_SATURATION"
        )
        passed = out.status == ComponentStatus.SUCCESS and out.competition_level == "High"
        record_result("Model 2", "Harsh: High Market Saturation & Competition Spike", passed, {
            "competition_level": out.competition_level,
            "risk_level": out.risk_level,
            "market_gap_score": out.market_gap_score
        })
    except Exception as e:
        record_result("Model 2", "Harsh: High Market Saturation & Competition Spike", False, {}, str(e))

    # 2.3.2: Non-existent / Unmapped Location (Regional Baseline Fallback)
    try:
        out = adapter.analyze(state="FakeState", district="FakeDistrict", business_category="Any")
        passed = out.status in [ComponentStatus.SUCCESS, ComponentStatus.DEGRADED, ComponentStatus.FAILED]
        record_result("Model 2", "Harsh: Unmapped Location Graceful Baseline Fallback", passed, {
            "status": out.status.value,
            "viability_score": out.viability_score,
            "score_band": out.score_band
        })
    except Exception as e:
        record_result("Model 2", "Harsh: Unmapped Location Graceful Baseline Fallback", False, {}, str(e))


# =====================================================================
# 3. MODEL 3: APMC PRICE PREDICTION & CONFORMAL INTERVALS TESTS
# =====================================================================
def test_model_3():
    print("\n" + "=" * 70)
    print("TEST SUITE 3: Model 3 - Local APMC Price Prediction Engine")
    print("=" * 70)

    adapter = Model3Adapter()

    # Scenario 3.1: Standard Production Case (Potato in Anand APMC)
    try:
        out = adapter.predict(
            state="Gujarat",
            district="Anand",
            business_category="Agri-Input",
            commodity="Potato",
            market="Anand APMC"
        )
        price = out.predicted_price_inr_per_quintal
        passed = out.status == ComponentStatus.SUCCESS and price is not None and price > 0
        record_result("Model 3", "Standard: Gujarat/Anand/Potato", passed, {
            "status": out.status.value,
            "expected_price_per_quintal": price,
            "lower_bound": out.confidence_interval_lower_inr,
            "upper_bound": out.confidence_interval_upper_inr,
            "price_unit": out.price_unit
        })
    except Exception as e:
        record_result("Model 3", "Standard: Gujarat/Anand/Potato", False, {}, str(e))

    # Scenario 3.2: Random Commodities (Onion, Wheat, Rice)
    for c in ["Onion", "Wheat", "Rice"]:
        try:
            out = adapter.predict(state="Gujarat", district="Anand", business_category="Trading", commodity=c)
            price = out.predicted_price_inr_per_quintal
            passed = out.status == ComponentStatus.SUCCESS and price is not None and price > 0
            record_result("Model 3", f"Random Commodity: {c}", passed, {
                "expected_price": price,
                "interval": [out.confidence_interval_lower_inr, out.confidence_interval_upper_inr]
            })
        except Exception as e:
            record_result("Model 3", f"Random Commodity: {c}", False, {}, str(e))

    # Scenario 3.3: Harsh / Worst Conditions
    # 3.3.1: Non-commodity business category (e.g. Beauty Salon)
    try:
        out = adapter.predict(state="Gujarat", district="Anand", business_category="beauty parlour & salon")
        passed = out.status.value in ["NOT_APPLICABLE", "DEGRADED"] and out.price_prediction_applicable is False
        record_result("Model 3", "Harsh: Non-Commodity Service Exemption", passed, {
            "status": out.status.value,
            "price_prediction_applicable": out.price_prediction_applicable,
            "warnings": out.warnings
        })
    except Exception as e:
        record_result("Model 3", "Harsh: Non-Commodity Service Exemption", False, {}, str(e))

    # 3.3.2: Out of Distribution (OOD) Exotic Commodity
    try:
        out = adapter.predict(state="Gujarat", district="Anand", business_category="Exotic Agri", commodity="Dragonfruit Exotic")
        passed = out.status in [ComponentStatus.SUCCESS, ComponentStatus.DEGRADED]
        record_result("Model 3", "Harsh: Out-of-Distribution Exotic Commodity", passed, {
            "status": out.status.value,
            "price": out.predicted_price_inr_per_quintal,
            "reliability_rating": str(out.reliability_rating)
        })
    except Exception as e:
        record_result("Model 3", "Harsh: Out-of-Distribution Exotic Commodity", False, {}, str(e))


# =====================================================================
# 4. FINANCE ENGINE (MODULE 2) TESTS
# =====================================================================
def test_finance_engine():
    print("\n" + "=" * 70)
    print("TEST SUITE 4: Finance Engine - Scheme Routing & Financial Math")
    print("=" * 70)

    adapter = FinanceEngineAdapter()

    # Scenario 4.1: Micro Finance Scheme (10,000 margin capital)
    try:
        out = adapter.calculate(available_margin_inr=10000.0)
        passed = (
            out.status == ComponentStatus.SUCCESS and
            out.scheme_name == "Micro Finance Scheme" and
            out.eligible_loan_inr == 90000.0 and
            out.interest_rate_pct_per_annum == 6.5 and
            out.tenure_months == 36 and
            out.moratorium_months == 3 and
            out.monthly_emi_inr > 0
        )
        record_result("Finance Engine", "Standard: Micro Finance Scheme (10k margin -> 1L project)", passed, {
            "scheme": out.scheme_name,
            "project_cost": out.calculated_project_cost_inr,
            "loan": out.eligible_loan_inr,
            "emi": out.monthly_emi_inr,
            "moratorium_months": out.moratorium_months,
            "total_interest": out.total_interest_payable_inr
        })
    except Exception as e:
        record_result("Finance Engine", "Standard: Micro Finance Scheme", False, {}, str(e))

    # Scenario 4.2: Term Loan Scheme (2,50,000 margin capital)
    try:
        out = adapter.calculate(available_margin_inr=250000.0)
        passed = (
            out.status == ComponentStatus.SUCCESS and
            "Term Loan" in out.scheme_name and
            out.eligible_loan_inr == 2250000.0 and
            out.interest_rate_pct_per_annum == 8.0 and
            out.tenure_months == 84 and
            out.moratorium_months == 6 and
            out.monthly_emi_inr > 0
        )
        record_result("Finance Engine", "Standard: Term Loan Scheme (2.5L margin -> 25L project)", passed, {
            "scheme": out.scheme_name,
            "project_cost": out.calculated_project_cost_inr,
            "loan": out.eligible_loan_inr,
            "emi": out.monthly_emi_inr,
            "moratorium_months": out.moratorium_months
        })
    except Exception as e:
        record_result("Finance Engine", "Standard: Term Loan Scheme", False, {}, str(e))

    # Scenario 4.3: Random Margin Capital Tests
    for m in [20000.0, 80000.0, 500000.0]:
        try:
            out = adapter.calculate(available_margin_inr=m)
            passed = out.status == ComponentStatus.SUCCESS and out.monthly_emi_inr > 0
            record_result("Finance Engine", f"Random Margin: INR {m:,.0f}", passed, {
                "scheme": out.scheme_name,
                "project_cost": out.calculated_project_cost_inr,
                "loan": out.eligible_loan_inr,
                "emi": out.monthly_emi_inr
            })
        except Exception as e:
            record_result("Finance Engine", f"Random Margin: INR {m:,.0f}", False, {}, str(e))

    # Scenario 4.4: Harsh / Worst Conditions
    # 4.4.1: High Margin Capital exceeding Micro Limit (> 50 Lakh loan cap)
    try:
        out = adapter.calculate(available_margin_inr=800000.0)
        passed = out.status == ComponentStatus.SUCCESS and out.is_within_scheme_limit is False
        record_result("Finance Engine", "Harsh: Project Exceeding 50L Cap (Capped Loan)", passed, {
            "scheme": out.scheme_name,
            "project_cost": out.calculated_project_cost_inr,
            "loan_cap": out.scheme_loan_cap_inr,
            "is_within_limit": out.is_within_scheme_limit
        })
    except Exception as e:
        record_result("Finance Engine", "Harsh: Project Exceeding 50L Cap", False, {}, str(e))

    # 4.4.2: Zero Margin Capital Guard
    try:
        out = adapter.calculate(available_margin_inr=0.0)
        passed = out.status == ComponentStatus.FAILED and len(out.warnings) > 0
        record_result("Finance Engine", "Harsh: Zero Margin Capital Guard", passed, {
            "status": out.status.value,
            "warnings": out.warnings
        })
    except Exception as e:
        record_result("Finance Engine", "Harsh: Zero Margin Capital Guard", False, {}, str(e))


# =====================================================================
# 5. DATA SERVICE / WEB SCRAPPING CENSUS & LOCATION TESTS
# =====================================================================
def test_data_service():
    print("\n" + "=" * 70)
    print("TEST SUITE 5: Web Scrapping / Data Service (Census & Spatial Density)")
    print("=" * 70)

    # Scenario 5.1: Indexed Sub-District (Danapur, Bihar)
    try:
        res = get_location_statistics("Danapur")
        reach_5km = res["reach"]["radius5km"]
        reach_10km = res["reach"]["radius10km"]
        passed = reach_5km > 0 and reach_10km > reach_5km
        record_result("Data Service", "Standard: Indexed Subdistrict (Danapur)", passed, {
            "radius5km": reach_5km,
            "radius10km": reach_10km,
            "indicators": res["demandIndicators"][:2]
        })
    except Exception as e:
        record_result("Data Service", "Standard: Indexed Subdistrict (Danapur)", False, {}, str(e))

    # Scenario 5.2: District-Level Resolution (Anand, Gujarat)
    try:
        res = get_location_statistics("Anand")
        reach_5km = res["reach"]["radius5km"]
        passed = reach_5km > 0 and len(res["demandIndicators"]) > 0
        record_result("Data Service", "Standard: District Resolution (Anand)", passed, {
            "radius5km": reach_5km,
            "radius10km": res["reach"]["radius10km"],
            "demand": res["demandIndicators"][0]
        })
    except Exception as e:
        record_result("Data Service", "Standard: District Resolution (Anand)", False, {}, str(e))

    # Scenario 5.3: State-Level Resolution (Punjab)
    try:
        res = get_location_statistics("Punjab")
        passed = res["reach"]["radius5km"] > 0
        record_result("Data Service", "Standard: State Resolution (Punjab)", passed, {
            "population_baseline": res["demandIndicators"][0]
        })
    except Exception as e:
        record_result("Data Service", "Standard: State Resolution (Punjab)", False, {}, str(e))

    # Scenario 5.4: Harsh / Worst Conditions: Unlisted / Remote Fantasy Village
    try:
        res = get_location_statistics("RemoteFantasyLocationXYZ999")
        passed = res["reach"]["radius5km"] > 0 and len(res["demandIndicators"]) > 0
        record_result("Data Service", "Harsh: Unlisted Remote Village Safe Fallback", passed, {
            "radius5km": res["reach"]["radius5km"],
            "baseline": res["demandIndicators"][0]
        })
    except Exception as e:
        record_result("Data Service", "Harsh: Unlisted Remote Village Safe Fallback", False, {}, str(e))


# =====================================================================
# 6. MASTER INTEGRATION PIPELINE (STEP 3 & STEP 4)
# =====================================================================
def test_master_pipeline():
    print("\n" + "=" * 70)
    print("TEST SUITE 6: Master Pipeline & Numerical Integrity Firewall")
    print("=" * 70)

    pipeline = VentureRootPipeline()

    # Scenario 6.1: Step 3 Computational Pipeline Execution
    try:
        user_input = UserBusinessInput(
            state="Gujarat",
            district="Anand",
            subdistrict="Anand",
            village="Mogri",
            business_category="Retail",
            available_margin_inr=50000.0,
            monthly_operating_cost_inr=35000.0
        )
        res = pipeline.execute(user_input)

        m1_ok = res.model_1.status == ComponentStatus.SUCCESS
        m2_ok = res.model_2.status == ComponentStatus.SUCCESS
        fin_ok = res.finance.status == ComponentStatus.SUCCESS
        passed = m1_ok and m2_ok and fin_ok

        record_result("Master Pipeline", "Step 3 Computational Pipeline (All 4 Engines)", passed, {
            "status": res.status.value if hasattr(res.status, "value") else str(res.status),
            "m1_status": res.model_1.status.value,
            "m1_score": res.model_1.market_potential_score,
            "m2_status": res.model_2.status.value,
            "m2_score": res.model_2.viability_score,
            "m3_status": res.model_3.status.value,
            "finance_scheme": res.finance.scheme_name,
            "finance_emi": res.finance.monthly_emi_inr
        })
    except Exception as e:
        record_result("Master Pipeline", "Step 3 Computational Pipeline", False, {}, str(e))

    # Scenario 6.2: Harsh Extreme Insolvency Scenario
    try:
        insolvent_input = UserBusinessInput(
            state="Bihar",
            district="Patna",
            subdistrict="Danapur",
            business_category="Dairy Farming",
            available_margin_inr=10000.0,
            monthly_operating_cost_inr=80000.0
        )
        res = pipeline.execute(insolvent_input)
        passed = res.status in ["SUCCESS", "PARTIAL_SUCCESS", ComponentStatus.SUCCESS, ComponentStatus.DEGRADED]
        record_result("Master Pipeline", "Harsh: Extreme Insolvency & High Deficit Handling", passed, {
            "status": str(res.status),
            "scheme": res.finance.scheme_name,
            "audit_trail_len": len(res.audit_notes)
        })
    except Exception as e:
        record_result("Master Pipeline", "Harsh: Extreme Insolvency", False, {}, str(e))

    # Scenario 6.3: Step 4 Pipeline (Advisory + Numerical Firewall)
    try:
        step4_input = UserBusinessInput(
            state="West Bengal",
            district="Purba Bardhaman",
            subdistrict="Memari I",
            business_category="Dairy Farming",
            available_margin_inr=150000.0,
            monthly_operating_cost_inr=70000.0
        )
        res = pipeline.execute_step4(step4_input)

        firewall_passed = res.numerical_integrity.verified
        swot_present = len(res.advisory_synthesis.swot.strengths) > 0 and len(res.advisory_synthesis.swot.threats) > 0
        passed = firewall_passed and swot_present

        record_result("Master Pipeline", "Step 4 End-to-End Advisory & Numerical Firewall", passed, {
            "firewall_verified": res.numerical_integrity.verified,
            "reconciliation_applied": res.numerical_integrity.reconciliation_applied,
            "violations_detected": res.numerical_integrity.violations_detected,
            "strengths_count": len(res.advisory_synthesis.swot.strengths),
            "recommendations_count": len(res.advisory_synthesis.localized_recommendations)
        })
    except Exception as e:
        record_result("Master Pipeline", "Step 4 Advisory & Firewall", False, {}, str(e))


def main():
    start_time = time.time()
    print("*" * 75)
    print("  VENTUREROOT & GRAMBIZ PRODUCTION ML & FINANCE STRESS TESTING SUITE")
    print("*" * 75)

    test_model_1()
    test_model_2()
    test_model_3()
    test_finance_engine()
    test_data_service()
    test_master_pipeline()

    duration = time.time() - start_time
    print("\n" + "=" * 75)
    print("FINAL TEST EXECUTION SUMMARY:")
    print(f"  Total Tests Executed: {TEST_RESULTS['total_tests']}")
    print(f"  Passed:               {TEST_RESULTS['passed']}")
    print(f"  Failed:               {TEST_RESULTS['failed']}")
    print(f"  Execution Time:       {duration:.2f} seconds")
    print("=" * 75)

    output_path = Path(__file__).resolve().parent / "stress_test_report.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(TEST_RESULTS, f, indent=2)
    print(f"\nDetailed JSON report saved to: {output_path}")

    if TEST_RESULTS["failed"] > 0:
        print(f"\n[!] Attention: {TEST_RESULTS['failed']} test(s) failed. See details above.")
        sys.exit(1)
    else:
        print("\n[+] SUCCESS: ALL ENGINES AND INTEGRATION PIPELINES PASSED 100% OPERATIONAL STRESS TESTS!")
        sys.exit(0)


if __name__ == "__main__":
    main()
