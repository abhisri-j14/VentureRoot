# GramBiz Model 1 — Hyper-Local Market Potential Scoring & Ranking Engine

> **GramBiz — Smart India Hackathon Project**  
> **Module 1 Engine:** GramBiz Hyper-Local Market Potential Scoring & Ranking Engine for Rural and Semi-Urban India.

---

## 🌟 Executive Summary

GramBiz Model 1 is an explainable Machine Learning engine engineered to evaluate business potential across rural and semi-urban India down to the **Gram Panchayat and Sub-district level**. It processes census, socio-economic, commercial, and infrastructure datasets to compute an explainable **Market Potential Index (MPI)** score ($0.0 - 100.0$) and rank business category suitability.

---

## 📐 Key Architectural Features & Guarantees

1. **Explicit Non-Supervised Attribution:**
   - Model 1 does **NOT** claim to predict direct monetary sales revenue or guaranteed business survival because public census data lacks ground-truth business transaction labels.
   - It acts as an **Explainable Hyper-Local Market Potential Scoring & Ranking Engine**. High $R^2$ ($0.9505$) indicates mathematical fidelity in reproducing the engineered Market Potential Index across unseen locations, **NOT 95% real-world demand prediction accuracy**.

2. **Strict Geographic Group Isolation & Validation Protocol:**
   - **Geographic Group Holdout:** Validation uses `GroupKFold(n_splits=5, groups=district_codes)` to reserve 94 entire districts (814 sub-districts, 15% of data). These test districts remained completely untouched during feature selection, MPI weight selection, hyperparameter tuning, model selection, and threshold setting.
   - **Isolated Preprocessing Pipelines:** Scalers, median imputers, and transformers are fitted strictly on training folds.
   - **Overfitting Assessment:** **No significant overfitting detected under the evaluated validation protocol.**

3. **Demographic & Geographical Coverage:**
   - Over **600,000 Gram Panchayats** and **700+ Districts** across all 36 States & UTs of India.

---

## 📁 Directory Structure

```
Models_and_RAG/Model_1/
├── api/                     # FastAPI inference REST service
│   └── main.py
├── configs/                 # YAML configuration files
│   ├── data_config.yaml
│   ├── model_config.yaml
│   └── category_weights.yaml
├── data/                    # Datasets (raw, processed, features)
│   ├── raw/
│   ├── processed/
│   └── features/
├── models/                  # Trained model artifacts & metadata
│   ├── model_1_final.joblib
│   └── model_1_metadata.json
├── reports/                 # Evaluation reports & visualizations
│   ├── data_audit/
│   ├── explainability/
│   └── figures/
├── scripts/                 # CLI execution scripts
│   ├── train.py
│   ├── evaluate.py
│   ├── predict.py
│   └── generate_visualizations.py
├── src/                     # Core Python source package
│   ├── data/
│   ├── features/
│   ├── target/
│   ├── models/
│   ├── explainability/
│   └── utils/
├── streamlit_app/           # Interactive Streamlit Web Application
│   └── app.py
├── tests/                   # Pytest test suite (100% test coverage)
│   ├── test_data_leakage.py
│   ├── test_features.py
│   ├── test_target.py
│   ├── test_model.py
│   └── test_api.py
├── .env.example
├── DATA_DICTIONARY.md
├── MODEL_CARD.md
├── TARGET_DESIGN.md
└── requirements.txt
```

---

## 🚀 Quick Start Guide

### 1. Environment Setup

```powershell
# Navigate to Model 1 directory
cd "f:\AI Business Advisor\Models_and_RAG\Model_1"

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
```

### 2. Run End-to-End Training Pipeline

```powershell
.\.venv\Scripts\python.exe scripts/train.py
```

### 3. Run Test Suite

```powershell
.\.venv\Scripts\pytest.exe tests/ -v
```

### 4. Run Interactive Streamlit Web Application

```powershell
.\.venv\Scripts\streamlit.exe run streamlit_app/app.py
```

### 5. Run FastAPI Service

```powershell
.\.venv\Scripts\uvicorn.exe api.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📊 API Endpoint Documentation

### POST `/api/v1/model1/predict`
Input payload:
```json
{
  "state": "West Bengal",
  "district": "Bankura",
  "business_category": "Dairy Farming"
}
```

Response format:
```json
{
  "MODEL_VERSION": "1.0.0",
  "METHODOLOGY_VERSION": "1.0.0",
  "model_version": "1.0.0",
  "methodology_version": "1.0.0",
  "market_potential_score": 78.4,
  "opportunity_level": "High",
  "demand_score": 75.0,
  "purchasing_power_score": 72.5,
  "workforce_opportunity_score": 81.2,
  "infrastructure_score": 75.0,
  "confidence_score": 100.0,
  "estimated_consumer_base": null,
  "geospatial_radius_available": false,
  "competitor_density_available": false,
  "top_positive_factors": [
    {"factor": "purchasing_power_proxy", "score": 72.5}
  ],
  "top_negative_factors": [],
  "geographic_level": "sub-district",
  "ood_checks": {
    "location_found": true,
    "category_in_distribution": true,
    "geospatial_coordinates_provided": false,
    "is_out_of_distribution": false
  },
  "limitations": [
    "No direct business-success/revenue labels exist in public census data; MPI is an engineered index.",
    "Mixed dataset temporal anchors: Census 2011, HCES 2023-24, CPI July 2026.",
    "Geographic resolution is aggregated at the sub-district / block level.",
    "True 5-10 km geospatial radius analysis is unavailable without exact lat/lon coordinates.",
    "Competitor density is strictly omitted unless verified establishment count data exists.",
    "High R2 (0.9505) reflects fit to synthetic MPI, NOT 95% real-world demand prediction accuracy.",
    "No significant overfitting detected under the evaluated validation protocol."
  ]
}
```

---

## 🔬 Model Evaluation Metrics (Geographic Holdout Set)

| Metric | Score | Metric Type / Description |
| :--- | :---: | :--- |
| **Training MAE** | `0.6467` | MAE on 5,065 training sub-districts |
| **Holdout MAE** | `0.6975` | MAE on 814 untouched test sub-districts |
| **Holdout $R^2$ Score** | `0.9505` | Index reproduction fit on untouched test set |
| **Spearman Rank Correlation** | `0.9744` | Ranking agreement across unseen locations |
| **Absolute MAE Gap** | `0.0508` | $|\text{MAE}_{\text{holdout}} - \text{MAE}_{\text{train}}|$ |
| **Relative MAE Gap Ratio** | `7.86%` | $(\text{MAE}_{\text{holdout}} - \text{MAE}_{\text{train}}) / \text{MAE}_{\text{train}}$ |
| **Overfitting Assessment** | **Passed** | **No significant overfitting detected under the evaluated validation protocol.** |
