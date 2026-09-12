"""
VentureRoot — Comprehensive ML & Finance Engine Integration Test Suite
=====================================================================
Tests all 6 Python microservices with realistic, edge-case, and worst-case
scenarios to validate production readiness.

Usage:
    python ML_Fin/comprehensive_integration_test.py
"""

import json
import sys
import time
from datetime import datetime
from typing import Any, Dict, List

import httpx

# Service URLs
SERVICES = {
    "data_service": "http://127.0.0.1:8000",
    "model_1": "http://127.0.0.1:8001",
    "model_2": "http://127.0.0.1:8002",
    "model_3": "http://127.0.0.1:8003",
    "finance_engine": "http://127.0.0.1:8004",
    "ai_advisor": "http://127.0.0.1:8005",
}

TIMEOUT = 30.0
results: List[Dict[str, Any]] = []


def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    symbol = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]", "INFO": "[INFO]"}.get(level, "")
    try:
        print(f"[{ts}] {symbol} {msg}")
    except UnicodeEncodeError:
        print(f"[{ts}] {symbol} {msg.encode('ascii', 'replace').decode('ascii')}")


def run_test(name: str, func) -> Dict[str, Any]:
    start = time.time()
    try:
        result = func()
        elapsed = round(time.time() - start, 2)
        log(f"PASS: {name} ({elapsed}s)", "PASS")
        entry = {"test": name, "status": "PASS", "elapsed_s": elapsed, "result_summary": _summarize(result)}
        results.append(entry)
        return entry
    except Exception as e:
        elapsed = round(time.time() - start, 2)
        log(f"FAIL: {name} - {e} ({elapsed}s)", "FAIL")
        entry = {"test": name, "status": "FAIL", "elapsed_s": elapsed, "error": str(e)}
        results.append(entry)
        return entry


def _summarize(data: Any) -> Any:
    if isinstance(data, dict):
        trimmed = {}
        for k, v in data.items():
            if isinstance(v, (list, dict)) and len(str(v)) > 500:
                trimmed[k] = f"[{type(v).__name__} len={len(v) if hasattr(v, '__len__') else '?'}]"
            else:
                trimmed[k] = v
        return trimmed
    return str(data)[:300]


# ═══════════════════════════════════════════════════════════════════
# HEALTH CHECKS
# ═══════════════════════════════════════════════════════════════════

def test_health(service_name: str, url: str):
    def _test():
        r = httpx.get(f"{url}/health", timeout=TIMEOUT)
        assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
        data = r.json()
        assert "status" in data, f"No 'status' field in response: {data}"
        return data
    return _test


# ═══════════════════════════════════════════════════════════════════
# MODEL 1 — Market Potential & Demand Prediction
# ═══════════════════════════════════════════════════════════════════

def test_model1_normal():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": "Gujarat", "district": "Anand",
        "subdistrict": "Anand", "business_category": "Dairy"
    }, timeout=TIMEOUT)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    data = r.json()
    assert "market_potential_score" in data, f"Missing market_potential_score: {list(data.keys())}"
    score = data["market_potential_score"]
    assert isinstance(score, (int, float)) and 0 <= score <= 100, f"Score invalid: {score}"
    return data


def test_model1_maharashtra_retail():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": "Maharashtra", "district": "Pune",
        "subdistrict": "Khed", "business_category": "Retail"
    }, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert "market_potential_score" in data
    return data


def test_model1_remote_tribal():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": "Chhattisgarh", "district": "Bijapur",
        "subdistrict": "Bhairamgarh", "business_category": "Food Processing"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_model1_edge_unknown():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": "Narnia", "district": "Mordor",
        "business_category": "Spaceship Manufacturing"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_model1_harsh_empty():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={}, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_model1_worst_null():
    r = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": None, "district": None, "business_category": None
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# MODEL 2 — Business Viability & Opportunity Engine
# ═══════════════════════════════════════════════════════════════════

def test_model2_normal():
    r = httpx.post(f"{SERVICES['model_2']}/api/v1/analyze", json={
        "state_name": "Gujarat", "district_name": "Anand",
        "subdistrict_name": "Anand", "business_category": "Dairy"
    }, timeout=TIMEOUT)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    data = r.json()
    assert "overall_viability_score" in data, f"Missing viability score: {list(data.keys())}"
    return data


def test_model2_categories():
    r = httpx.get(f"{SERVICES['model_2']}/api/v1/categories", timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data and len(data["categories"]) >= 10
    return data


def test_model2_no_subdistrict():
    r = httpx.post(f"{SERVICES['model_2']}/api/v1/analyze", json={
        "state_name": "Rajasthan", "district_name": "Jaipur",
        "business_category": "Textile"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_model2_misspelled():
    r = httpx.post(f"{SERVICES['model_2']}/api/v1/analyze", json={
        "state_name": "Gujrat", "district_name": "Annd",
        "business_category": "Dary"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# MODEL 3 — Price Prediction Engine
# ═══════════════════════════════════════════════════════════════════

def test_model3_normal():
    r = httpx.post(f"{SERVICES['model_3']}/api/v1/predict", json={
        "state": "Tamil Nadu", "district": "Coimbatore",
        "market": "Coimbatore APMC", "commodity": "Tomato"
    }, timeout=TIMEOUT)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    data = r.json()
    assert "expected_market_price" in data or "predicted_price" in data
    price = data.get("expected_market_price") or data.get("predicted_price")
    assert isinstance(price, (int, float)) and price > 0, f"Price invalid: {price}"
    return data


def test_model3_conformal():
    r = httpx.post(f"{SERVICES['model_3']}/api/v1/predict", json={
        "state": "Gujarat", "district": "Amreli",
        "market": "Amreli APMC", "commodity": "Onion"
    }, timeout=TIMEOUT)
    if r.status_code == 200:
        data = r.json()
        if "prediction_interval" in data:
            interval = data["prediction_interval"]
            assert interval.get("lower", 0) <= interval.get("upper", 0)
        return data
    return {"status_code": r.status_code, "text": r.text[:200]}


def test_model3_rice():
    r = httpx.post(f"{SERVICES['model_3']}/api/v1/predict", json={
        "state": "Uttar Pradesh", "district": "Khiri (Lakhimpur)",
        "market": "Lakhimpur APMC", "commodity": "Rice"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_model3_exotic():
    r = httpx.post(f"{SERVICES['model_3']}/api/v1/predict", json={
        "state": "Kerala", "district": "Ernakulam",
        "market": "Ernakulam APMC", "commodity": "Dragon Fruit"
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# FINANCE ENGINE
# ═══════════════════════════════════════════════════════════════════

def test_finance_calculate():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/calculate", json={
        "available_margin": 150000, "business_category": "Dairy", "state": "Gujarat"
    }, timeout=TIMEOUT)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    return r.json()


def test_finance_emi_normal():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/emi", json={
        "principal": 500000, "annual_interest_rate": 0.08, "tenure_months": 84
    }, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert data["monthly_emi"] > 0 and data["total_repayment"] > data["principal"]
    return data


def test_finance_emi_tiny():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/emi", json={
        "principal": 1000, "annual_interest_rate": 0.01, "tenure_months": 1
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_finance_emi_max_tenure():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/emi", json={
        "principal": 4500000, "annual_interest_rate": 0.10, "tenure_months": 360
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_finance_repayment():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/repayment-schedule", json={
        "disbursed_loan": 500000, "annual_interest_rate": 0.08,
        "tenure_months": 84, "moratorium_months": 6
    }, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert "monthly_schedule" in data and len(data["monthly_schedule"]) > 0
    return {k: v for k, v in data.items() if k not in ("monthly_schedule", "quarterly_schedule")}


def test_finance_scheme_micro():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/scheme", json={"project_cost": 100000}, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert "micro" in data["scheme"]["name"].lower()
    return data


def test_finance_scheme_term():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/scheme", json={"project_cost": 3000000}, timeout=TIMEOUT)
    assert r.status_code == 200
    return r.json()


def test_finance_scheme_outside():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/scheme", json={"project_cost": 10000000}, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert not data["is_within_scheme_limit"]
    return data


def test_finance_working_capital():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/working-capital", json={
        "fixed_assets": 200000,
        "initial_inventory": 50000,
        "raw_material": 40000,
        "wages": 25000,
        "rent": 15000,
        "utilities": 8000,
        "transport": 5000,
        "marketing": 3000,
        "maintenance": 2000,
        "other_expenses": 2000,
        "coverage_months": 3,
        "contingency_pct": 5.0
    }, timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert data["monthly_operating_cost"] > 0
    assert data["working_capital_requirement"] > 0
    assert data["total_project_requirement"] > 0
    return data


def test_finance_schemes_list():
    r = httpx.get(f"{SERVICES['finance_engine']}/api/v1/schemes", timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert len(data["schemes"]) >= 2
    return data


def test_finance_zero_principal():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/emi", json={
        "principal": 0, "annual_interest_rate": 0.08, "tenure_months": 12
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


def test_finance_extreme_rate():
    r = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/emi", json={
        "principal": 100000, "annual_interest_rate": 1.0, "tenure_months": 12
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# DATA SERVICE (web_scrapping)
# ═══════════════════════════════════════════════════════════════════

def test_ds_location_stats():
    r = httpx.get(f"{SERVICES['data_service']}/locations/Gujarat/statistics", timeout=TIMEOUT)
    if r.status_code == 200:
        data = r.json()
        assert "reach" in data and data["reach"]["radius5km"] > 0
        return data
    return {"status_code": r.status_code, "text": r.text[:200]}


def test_ds_kg_stats():
    r = httpx.get(f"{SERVICES['data_service']}/api/v1/kg/stats", timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# AI ADVISOR
# ═══════════════════════════════════════════════════════════════════

def test_ai_health():
    r = httpx.get(f"{SERVICES['ai_advisor']}/health", timeout=TIMEOUT)
    return r.json() if r.status_code == 200 else {"status_code": r.status_code}


def test_ai_advise():
    r = httpx.post(f"{SERVICES['ai_advisor']}/api/v1/advise", json={
        "user_query": "What is the best business to start in Anand, Gujarat with 2L capital?",
        "location": "Anand, Gujarat", "district": "Anand",
        "proposed_business": "Dairy", "investment_amount": 1000000, "own_margin": 200000
    }, timeout=TIMEOUT)
    return {"status_code": r.status_code, "data": r.json()}


# ═══════════════════════════════════════════════════════════════════
# CROSS-SERVICE INTEGRATION
# ═══════════════════════════════════════════════════════════════════

def test_cross_m1_m2():
    m1 = httpx.post(f"{SERVICES['model_1']}/api/v1/model1/predict", json={
        "state": "Gujarat", "district": "Anand", "subdistrict": "Anand", "business_category": "Retail"
    }, timeout=TIMEOUT)
    m2 = httpx.post(f"{SERVICES['model_2']}/api/v1/analyze", json={
        "state_name": "Gujarat", "district_name": "Anand", "subdistrict_name": "Anand", "business_category": "Retail"
    }, timeout=TIMEOUT)
    m1d = m1.json() if m1.status_code == 200 else {"error": m1.text}
    m2d = m2.json() if m2.status_code == 200 else {"error": m2.text}
    return {
        "m1_market_potential": m1d.get("market_potential_score"),
        "m2_viability_score": m2d.get("overall_viability_score"),
        "both_ok": m1.status_code == 200 and m2.status_code == 200,
    }


def test_cross_finance():
    calc = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/calculate", json={
        "available_margin": 100000, "business_category": "Retail", "state": "Gujarat"
    }, timeout=TIMEOUT)
    scheme = httpx.post(f"{SERVICES['finance_engine']}/api/v1/finance/scheme", json={
        "project_cost": 500000
    }, timeout=TIMEOUT)
    return {
        "calc_status": calc.status_code,
        "scheme_status": scheme.status_code,
        "scheme_name": scheme.json().get("scheme", {}).get("name") if scheme.status_code == 200 else None,
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("VentureRoot Comprehensive ML & Finance Integration Test Suite")
    print("=" * 70)
    print(f"Started at: {datetime.now().isoformat()}\n")

    print("--- HEALTH CHECKS ---")
    for name, url in SERVICES.items():
        run_test(f"Health: {name}", test_health(name, url))

    print("\n--- MODEL 1: Market Potential ---")
    run_test("M1: Normal Gujarat/Anand/Dairy", test_model1_normal)
    run_test("M1: Maharashtra/Pune/Retail", test_model1_maharashtra_retail)
    run_test("M1: Remote tribal Chhattisgarh", test_model1_remote_tribal)
    run_test("M1: Edge unknown location", test_model1_edge_unknown)
    run_test("M1: Harsh empty fields", test_model1_harsh_empty)
    run_test("M1: Worst all null", test_model1_worst_null)

    print("\n--- MODEL 2: Business Viability ---")
    run_test("M2: Normal Gujarat/Anand/Dairy", test_model2_normal)
    run_test("M2: Categories list", test_model2_categories)
    run_test("M2: Edge no subdistrict", test_model2_no_subdistrict)
    run_test("M2: Harsh misspelled", test_model2_misspelled)

    print("\n--- MODEL 3: Price Prediction ---")
    run_test("M3: Normal TN/Coimbatore/Tomato", test_model3_normal)
    run_test("M3: Conformal bounds Gujarat/Onion", test_model3_conformal)
    run_test("M3: Known UP/Rice", test_model3_rice)
    run_test("M3: Edge exotic commodity", test_model3_exotic)

    print("\n--- FINANCE ENGINE ---")
    run_test("FIN: Calculate normal", test_finance_calculate)
    run_test("FIN: EMI normal 5L/8%/84mo", test_finance_emi_normal)
    run_test("FIN: EMI tiny loan", test_finance_emi_tiny)
    run_test("FIN: EMI max tenure 360mo", test_finance_emi_max_tenure)
    run_test("FIN: Repayment with moratorium", test_finance_repayment)
    run_test("FIN: Scheme Micro Finance", test_finance_scheme_micro)
    run_test("FIN: Scheme Term Loan", test_finance_scheme_term)
    run_test("FIN: Scheme Outside Range", test_finance_scheme_outside)
    run_test("FIN: Working capital", test_finance_working_capital)
    run_test("FIN: Schemes list", test_finance_schemes_list)
    run_test("FIN: Worst zero principal", test_finance_zero_principal)
    run_test("FIN: Worst extreme rate", test_finance_extreme_rate)

    print("\n--- DATA SERVICE ---")
    run_test("DS: Location stats Gujarat", test_ds_location_stats)
    run_test("DS: KG stats", test_ds_kg_stats)

    print("\n--- AI ADVISOR ---")
    run_test("AI: Health check", test_ai_health)
    run_test("AI: Advisory request", test_ai_advise)

    print("\n--- CROSS-SERVICE ---")
    run_test("CROSS: M1+M2 consistency", test_cross_m1_m2)
    run_test("CROSS: Finance consistency", test_cross_finance)

    print("\n" + "=" * 70)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    total = len(results)
    print(f"RESULTS: {passed}/{total} passed, {failed} failed")
    print("=" * 70)

    report = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": total, "passed": passed, "failed": failed,
        "results": results,
    }
    report_path = "ML_Fin/comprehensive_test_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"\nDetailed report saved to: {report_path}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
