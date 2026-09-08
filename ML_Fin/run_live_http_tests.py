import sys
import time
import json
from pathlib import Path

BACKEND_DIR = Path("F:/AI Business Advisor/backend")
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

scenarios = [
    {
        "id": 1,
        "name": "Rural Dairy Processing (Bankura, West Bengal)",
        "payload": {
            "state": "West Bengal",
            "district": "Bankura",
            "sub_district": "Bankura-I",
            "business_category": "Dairy Processing",
            "product_service": "Packet Milk & Ghee",
            "commodity": "Potato",
            "available_margin": 100000.0,
            "proposed_budget": 1200000.0,
            "operating_expenses": 25000.0,
            "user_question": "Is starting a dairy processing plant in Bankura financially viable with PMEGP scheme support?"
        }
    },
    {
        "id": 2,
        "name": "Organic Rice Milling (Varanasi, Uttar Pradesh)",
        "payload": {
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "sub_district": "Varanasi-Sadar",
            "business_category": "Food Processing",
            "product_service": "Mini Rice Mill & Packaging",
            "commodity": "Paddy",
            "available_margin": 300000.0,
            "proposed_budget": 2500000.0,
            "operating_expenses": 40000.0,
            "user_question": "What is the market potential and subsidy eligibility for a mini rice mill in Varanasi?"
        }
    },
    {
        "id": 3,
        "name": "Solar Cold Storage & Logistics (Muzaffarpur, Bihar)",
        "payload": {
            "state": "Bihar",
            "district": "Muzaffarpur",
            "sub_district": "Muzaffarpur",
            "business_category": "Agriculture",
            "product_service": "Solar Cold Storage Unit",
            "commodity": "Maize",
            "available_margin": 500000.0,
            "proposed_budget": 5000000.0,
            "operating_expenses": 80000.0,
            "user_question": "Can I set up a solar cold storage facility in Muzaffarpur for maize and vegetables under government credit schemes?"
        }
    },
    {
        "id": 4,
        "name": "Traditional Handloom Weaving (Cuttack, Odisha)",
        "payload": {
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Cuttack-Sadar",
            "business_category": "Handicrafts",
            "product_service": "Traditional Handloom Textiles",
            "commodity": "Cotton",
            "available_margin": 50000.0,
            "proposed_budget": 500000.0,
            "operating_expenses": 15000.0,
            "user_question": "What are the scheme benefits and interest subvention for handloom weavers in Cuttack?"
        }
    },
    {
        "id": 5,
        "name": "Poultry Farm & Feed Unit (Namakkal, Tamil Nadu)",
        "payload": {
            "state": "Tamil Nadu",
            "district": "Namakkal",
            "sub_district": "Namakkal",
            "business_category": "Poultry",
            "product_service": "Broiler Poultry & Feeds",
            "commodity": "Maize",
            "available_margin": 200000.0,
            "proposed_budget": 1800000.0,
            "operating_expenses": 35000.0,
            "user_question": "Evaluate competitive risks, feed price forecast, and EMI repayment structure for a poultry farm in Namakkal."
        }
    },
    {
        "id": 6,
        "name": "Kirana Supermarket Retail (Satara, Maharashtra)",
        "payload": {
            "state": "Maharashtra",
            "district": "Satara",
            "sub_district": "Satara",
            "business_category": "Retail",
            "product_service": "FMCG & Kirana Supermarket",
            "commodity": "Onion",
            "available_margin": 150000.0,
            "proposed_budget": 800000.0,
            "operating_expenses": 20000.0,
            "user_question": "What is the viability and risk level of opening a modern Kirana retail supermarket in Satara?"
        }
    },
    {
        "id": 7,
        "name": "EV Two-Wheeler Workshop (Jaipur, Rajasthan)",
        "payload": {
            "state": "Rajasthan",
            "district": "Jaipur",
            "sub_district": "Jaipur",
            "business_category": "Repair/Maintenance",
            "product_service": "EV & Two-Wheeler Workshop",
            "commodity": "Wheat",
            "available_margin": 75000.0,
            "proposed_budget": 600000.0,
            "operating_expenses": 18000.0,
            "user_question": "Is an EV and multi-brand two-wheeler workshop viable in Jaipur with Mudra loan support?"
        }
    },
    {
        "id": 8,
        "name": "Fish & Aqua Processing (West Godavari, Andhra Pradesh)",
        "payload": {
            "state": "Andhra Pradesh",
            "district": "West Godavari",
            "sub_district": "Bhimavaram",
            "business_category": "Fisheries",
            "product_service": "Fish & Shrimp Processing",
            "commodity": "Fish",
            "available_margin": 400000.0,
            "proposed_budget": 3500000.0,
            "operating_expenses": 60000.0,
            "user_question": "What is the financial feasibility and subsidy breakdown under PMMSY for fish processing in West Godavari?"
        }
    },
    {
        "id": 9,
        "name": "Large-Scale Fruit Juice Processing (Ludhiana, Punjab) [High Capital Edge Case]",
        "payload": {
            "state": "Punjab",
            "district": "Ludhiana",
            "sub_district": "Ludhiana",
            "business_category": "Manufacturing",
            "product_service": "Packaged Agro-Juices",
            "commodity": "Wheat",
            "available_margin": 1000000.0,
            "proposed_budget": 15000000.0,
            "operating_expenses": 200000.0,
            "user_question": "Assess large scale agro-juice manufacturing in Ludhiana with 1.5 Crore budget."
        }
    },
    {
        "id": 10,
        "name": "Micro Digital Services Kiosk (Kamrup, Assam) [Ultra-Low Margin Edge Case]",
        "payload": {
            "state": "Assam",
            "district": "Kamrup",
            "sub_district": "Guwahati",
            "business_category": "Personal Services",
            "product_service": "Mobile Repair & Digital Kiosk",
            "commodity": "Mustard",
            "available_margin": 15000.0,
            "proposed_budget": 250000.0,
            "operating_expenses": 8000.0,
            "user_question": "Can a low-income entrepreneur in Kamrup get 95% funding for a digital services kiosk?"
        }
    }
]

def run_tests():
    print(f"Starting Live Test Client Audit for {len(scenarios)} Scenarios...\n")
    results = []

    for item in scenarios:
        scen_id = item["id"]
        name = item["name"]
        payload = item["payload"]
        
        print(f"[{scen_id}/10] Testing: {name}...")
        start_t = time.time()
        try:
            resp = client.post("/api/v1/analyze-business", json=payload)
            elapsed_ms = round((time.time() - start_t) * 1000, 2)
            status_code = resp.status_code
            
            if status_code == 200:
                data = resp.json()
                results.append({
                    "id": scen_id,
                    "name": name,
                    "status_code": status_code,
                    "latency_ms": elapsed_ms,
                    "payload": payload,
                    "response": data,
                    "error": None
                })
                print(f"  -> SUCCESS ({status_code}) in {elapsed_ms}ms | Rec: {str(data.get('executive_recommendation'))[:60]}...")
            else:
                results.append({
                    "id": scen_id,
                    "name": name,
                    "status_code": status_code,
                    "latency_ms": elapsed_ms,
                    "payload": payload,
                    "response": None,
                    "error": resp.text
                })
                print(f"  -> FAILED ({status_code}) in {elapsed_ms}ms")
        except Exception as e:
            elapsed_ms = round((time.time() - start_t) * 1000, 2)
            results.append({
                "id": scen_id,
                "name": name,
                "status_code": 500,
                "latency_ms": elapsed_ms,
                "payload": payload,
                "response": None,
                "error": str(e)
            })
            print(f"  -> EXCEPTION in {elapsed_ms}ms: {e}")

    # Save JSON raw results to scratch
    out_json = Path(__file__).resolve().parent / "live_http_test_results.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nRaw results saved to {out_json}")
    return results

if __name__ == "__main__":
    run_tests()
