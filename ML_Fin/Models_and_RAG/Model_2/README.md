# GramBiz Model 2 — Business Viability & Opportunity Analysis Engine

GramBiz Model 2 evaluates hyper-local business viability, competition pressure, risk factors, and 15-category opportunity rankings for rural and semi-urban entrepreneurs across India.

## Key Features
- **15-Category Opportunity Ranking:** Evaluates Dairy, Retail, Textiles, Food Processing, Agriculture, Fisheries, Poultry, Handicrafts, Manufacturing, Services, Repair/Maintenance, Transport, Hospitality, Personal Services, and Other.
- **Geographic GroupKFold Validation:** Validated on 96 untouched holdout districts (888 sub-districts).
- **Target Integrity & Anti-Leakage:** Target construction components strictly isolated from ML input features.
- **Out-of-Distribution Safety:** Automatic OOD detection for unseen geographies and extreme feature inputs.
- **FastAPI REST Server:** Production-ready REST endpoints listening on Port `8002`.
- **Streamlit Demo Workspace:** 8-workspace interactive dashboard for testing and evaluation.

## Quick Start

### 1. Model Training
```bash
python scripts/train.py
```

### 2. Launch FastAPI REST Server
```bash
python api/main.py
```

### 3. Launch Streamlit Application
```bash
streamlit run streamlit_app/app.py
```

### 4. Run Test Suite
```bash
pytest tests/ -v
```
