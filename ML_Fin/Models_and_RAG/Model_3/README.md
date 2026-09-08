# GramBiz Model 3 — Local Market Price Prediction Engine

> **GramBiz — Smart India Hackathon Project**  
> **Module 3 Engine:** Hyper-Local Agricultural Price Forecasting & Conformal Uncertainty Quantification Engine.

---

## Executive Summary

GramBiz Model 3 is a production-grade ML service engineered to estimate **actual observed local market prices ($\text{₹/quintal}$)** across Indian APMC markets. Given a location, agricultural commodity, date, and historical economic context, Model 3 delivers:
1. **Expected Market Price** (Point prediction in ₹/quintal).
2. **Conformal Prediction Interval Bounds** (90% coverage interval $[y_{lower}, y_{upper}]$).
3. **Recommended Selling Price** (Volatility-buffered selling price policy).
4. **Out-of-Distribution (OOD) & Data Completeness Audit**.

> **STRICT STATISTICAL HONESTY GUARANTEE**: Model 3 predicts actual observed market transaction prices from AGMARKNET / Data.gov.in. It does **NOT** use artificially constructed indices or synthetic targets.

---

## Directory Structure

```
Models_and_RAG/Model_3/
├── api/                     # FastAPI inference REST server (Port 8003)
│   ├── main.py
│   ├── dependencies.py
│   └── schemas.py
├── data/                    # Structured data directories
│   ├── raw/                 # Original raw datasets (prices, economic, agriculture)
│   ├── cached/              # Data.gov.in API snapshots & provenances
│   ├── interim/             # Cleaned intermediate files
│   ├── processed/           # Feature matrix
│   ├── DATASET_INVENTORY.csv
│   └── DATASET_INVENTORY.md
├── artifacts/               # Model joblibs & metadata
│   ├── models/
│   │   ├── champion_model.joblib
│   │   ├── scaler.joblib
│   │   ├── conformal.joblib
│   │   └── imputer.joblib
│   ├── data_provenance.json
│   └── model_3_metadata.json
├── scripts/                 # CLI pipeline execution scripts
│   ├── inspect_data.py
│   ├── fetch_data.py
│   ├── prepare_data.py
│   ├── run_leakage_audit.py
│   ├── train.py
│   ├── predict.py
│   └── ...
├── src/                     # Core Python package
│   ├── data/
│   ├── units/
│   ├── geographic/
│   ├── features/
│   ├── models/
│   ├── uncertainty/
│   └── inference/
├── streamlit_app/           # Interactive testing & demo web dashboard
│   └── app.py
├── tests/                   # Pytest test suite (100% pass)
├── Dockerfile               # Production container specification
├── .env.example
├── README.md
├── MODEL_CARD.md
├── DATA_DICTIONARY.md
├── VALIDATION_REPORT.md
└── FINAL_MODEL_3_REPORT.md
```

---

## Quick Start Guide

### 1. Execute End-to-End Pipeline
```powershell
# Navigate to Model 3 directory
cd "f:\AI Business Advisor\Models_and_RAG\Model_3"

# 1. Prepare Data & Feature Matrix
python scripts/prepare_data.py

# 2. Run Leakage Audit
python scripts/run_leakage_audit.py

# 3. Train Pipeline & Benchmark Candidate Models
python scripts/train.py
```

### 2. Run Pytest Test Suite
```powershell
python -m pytest tests/ -v
```

### 3. Run FastAPI Inference REST API (Port 8003)
```powershell
python -m uvicorn api.main:app --host 0.0.0.0 --port 8003
```
- Health Check: `http://localhost:8003/health`
- Swagger Docs: `http://localhost:8003/docs`

### 4. Run Interactive Streamlit Dashboard
```powershell
python -m streamlit run streamlit_app/app.py
```
Access dashboard UI at `http://localhost:8501`.

---

## API Request & Response Specification

### POST `/api/v1/predict`

**Input Payload:**
```json
{
  "state": "West Bengal",
  "district": "Bankura",
  "market": "Bankura APMC",
  "commodity": "Potato",
  "recent_observed_price": 2200.0
}
```

**Response Payload:**
```json
{
  "price_prediction_available": true,
  "product": {
    "commodity": "Potato",
    "variety": "Standard / Local",
    "grade": "FAQ"
  },
  "location": {
    "state": "West Bengal",
    "district": "Bankura",
    "market": "Bankura APMC"
  },
  "prediction_date": "2026-09-05",
  "expected_market_price": 2185.50,
  "recommended_price_range": {
    "lower": 2050.00,
    "upper": 2321.00
  },
  "recommended_selling_price": 2199.00,
  "currency": "INR",
  "unit": "₹/quintal",
  "uncertainty": {
    "prediction_interval_width": 271.00,
    "coverage_confidence": "90%",
    "conformal_qhat": 135.50
  },
  "data_completeness": 1.0,
  "ood_checks": {
    "is_out_of_distribution": false,
    "severity": "NONE",
    "warnings": []
  },
  "MODEL_VERSION": "1.0.0",
  "METHODOLOGY_VERSION": "1.0.0"
}
```

---

## Model Governance & Ethical Disclaimers
This model estimates local market price trends from available historical market observations. It does **NOT** guarantee future transaction prices or business profit.
