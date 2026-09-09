# GramBiz — AI Business Advisor & Decision Support System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.25+-red.svg)](https://streamlit.io/)
[![Status](https://img.shields.io/badge/System--Status-INTEGRATION--VALIDATED-brightgreen.svg)](#system-verification--test-results)

**GramBiz** is an enterprise-grade, hyper-local AI Business Advisor designed for rural and semi-urban entrepreneurs across India. It integrates **machine learning engines**, **conformal price forecasting**, **deterministic scheme calculators**, **vector RAG retrieval**, and an **AI Advisory Agent** guarded by a **Numerical Integrity Firewall**.

---

## 🏗 System Architecture & Component Overview

```
                                 ┌─────────────────────────────────┐
                                 │     Streamlit Frontend UI       │
                                 │       (10 Multi-Page App)       │
                                 └────────────────┬────────────────┘
                                                  │ HTTP REST API
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │     FastAPI Backend Gateway     │
                                 │      (PORT 8000 /api/v1)        │
                                 └────────────────┬────────────────┘
                                                  │ Orchestrator
            ┌───────────────────┬─────────────────┼─────────────────┬───────────────────┐
            ▼                   ▼                 ▼                 ▼                   ▼
    ┌───────────────┐   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   ┌───────────────┐
    │    Model 1    │   │    Model 2    │ │    Model 3    │ │ Finance Engine│   │  RAG System   │
    │Market Potential│  │  Viability    │ │ Price Predict │ │  Calculator   │   │Govt Retrieval │
    └───────┬───────┘   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘   └───────┬───────┘
            │                   │                 │                 │                   │
            └───────────────────┴─────────────────┼─────────────────┴───────────────────┘
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │        AI Advisor Agent         │
                                 │  (Gemini + Numerical Firewall)  │
                                 └─────────────────────────────────┘
```

### 🧠 Constituent Engines

1. **Model 1 — Hyper-Local Market Potential Engine**
   - Calculates sub-district level Market Potential Index (MPI 0-100) using Census 2011 PCA data, MSME density, and purchasing power indicators.
2. **Model 2 — Business Viability & Competition Engine**
   - Evaluates 15 canonical business categories across Indian districts to derive Viability Score, Demand Gap, Competition Density, and Micro-Risk Index.
3. **Model 3 — Local Market Price Prediction Engine**
   - Predicts wholesale APMC commodity prices with non-negative 90% conformal prediction intervals and recommended retail selling price benchmarks.
4. **Finance Engine — Deterministic Financial & Scheme Calculator**
   - Authoritative source for loan eligibility, promoter contribution, PMEGP/Stand Up India/Mudra scheme subsidies, interest subvention, and monthly EMI amortization.
5. **RAG — Government Schemes & Regulatory Knowledge Retrieval System**
   - Vector embedding retrieval system delivering verified government scheme guidelines, eligibility rules, and compliance citations with explicit abstention safety.
6. **AI Advisor — Gemini-Powered Advisory Agent & Numerical Integrity Firewall**
   - Synthesizes holistic business advice while enforcing a strict Numerical Integrity Firewall to prevent value mutation or hallucinated calculations.

---

## 📁 Repository Structure

```text
AI Business Advisor/
├── backend/                        # FastAPI Backend Gateway Service
│   ├── app/
│   │   ├── main.py                 # FastAPI Gateway Application Entry Point
│   │   ├── config.py               # Environment Configuration & Mode Settings
│   │   ├── clients/                # Microservice Client Adapters (LOCAL/REMOTE)
│   │   ├── routes/v1/              # Versioned API Routers (9 REST Endpoints)
│   │   └── services/               # Master Orchestrator Service
│   └── tests/                      # Gateway Integration & Unit Test Suite
├── frontend/                       # Streamlit Frontend Multi-Page Application
│   ├── app.py                      # Main Streamlit Application Entry Point
│   ├── pages/                      # 10 Multi-Page Application Tabs
│   ├── services/                   # Backend REST API Client Adapter
│   └── tests/                      # Frontend Integration Tests
├── Models_and_RAG/                 # ML Models, Finance Calculator & RAG Core
│   ├── Model_1/                    # Market Potential Engine & Notebooks
│   ├── Model_2/                    # Business Viability Engine & Notebooks
│   ├── Model_3/                    # Price Prediction Engine & Notebooks
│   │   └── notebooks/              # Jupyter Notebooks (01_GramBiz_Model3...)
│   ├── Finance_Engine/             # Deterministic Financial Calculator
│   ├── RAG/                        # Vector Retrieval & Scheme Guidelines
│   └── AI_Advisor/                 # Gemini Advisor Agent & Numerical Firewall
├── docs/                           # Architecture, Audit & Benchmark Documentation
│   ├── FINAL_CROSS_ENGINE_AUDIT.md # Cross-Service Audit & Data Flow Controls
│   ├── FINAL_SYSTEM_VALIDATION_REPORT.md # Test Summary & Golden Scenario Report
│   ├── FINAL_SYSTEM_STATUS.md      # Formal System Status Record
│   └── LIVE_API_REAL_WORLD_BENCHMARK.md  # 10 Real-World Live HTTP Test Results
└── .env.example                    # Root Environment Template
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Environment Prerequisites
Ensure Python 3.10+ is installed. Create and configure your root `.env` file:
```bash
cp .env.example .env
```
*(Add your `GEMINI_API_KEY` to the `.env` file)*

### 2. Launch FastAPI Backend Gateway
Open PowerShell in the project root:
```powershell
cd "F:\AI Business Advisor\backend"
& "..\Models_and_RAG\Model_1\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger UI Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Launch Streamlit Frontend Application
Open a second PowerShell tab:
```powershell
cd "F:\AI Business Advisor\frontend"
& "..\Models_and_RAG\Model_1\.venv\Scripts\python.exe" -m streamlit run app.py
```
- **Streamlit Web Application:** [http://localhost:8501](http://localhost:8501)

---

## 🧪 Test Execution & Verification

To run the complete automated test suite across all constituent engines and backend gateway:

```powershell
# Run Backend Gateway Test Suite (30 Tests)
cd "F:\AI Business Advisor\backend"
& "..\Models_and_RAG\Model_1\.venv\Scripts\python.exe" -m pytest tests/

# Run Frontend Application Test Suite (3 Tests)
cd "F:\AI Business Advisor\frontend"
& "..\Models_and_RAG\Model_1\.venv\Scripts\python.exe" -m pytest tests/

# Re-run Live API Verification Script across all 9 endpoints
cd "F:\AI Business Advisor\backend"
& "..\Models_and_RAG\Model_1\.venv\Scripts\python.exe" tests/verify_live_api.py
```

### 📊 System Test Pass Rate
- **Model 1 Engine Tests:** `50 / 50 Passed`
- **Model 2 Engine Tests:** `28 / 28 Passed`
- **Model 3 Engine Tests:** `21 / 21 Passed`
- **Finance Engine Tests:** `18 / 18 Passed`
- **RAG Retrieval Tests:** `24 / 24 Passed`
- **AI Advisor Tests:** `21 / 21 Passed`
- **Backend Gateway Integration:** `30 / 30 Passed`
- **Frontend UI Integration:** `3 / 3 Passed`
- **TOTAL SUITE:** **`195 / 195 Tests Passed` (100%)**

---

## 📡 REST API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Gateway health check status |
| `GET` | `/api/v1/system-info` | Constituent service mode query (LOCAL/REMOTE) |
| `POST` | `/api/v1/market-potential` | Model 1 sub-district market potential analysis |
| `POST` | `/api/v1/business-viability` | Model 2 category viability & competition analysis |
| `POST` | `/api/v1/price-prediction` | Model 3 wholesale price & 90% conformal bounds |
| `POST` | `/api/v1/finance` | Finance Engine loan, EMI, subsidy calculation |
| `POST` | `/api/v1/rag/query` | RAG government scheme & regulation retrieval |
| `POST` | `/api/v1/advice` | AI Advisor Agent synthesis & numerical firewall |
| `POST` | `/api/v1/analyze-business` | Master unified end-to-end business feasibility analysis |

---

## 🔒 Security & Governance

- **Numerical Integrity Firewall:** Reconciles AI Advisor output against authoritative Finance calculations, enforcing exact match for project cost, loan amount, and monthly EMI.
- **Zero Cross-Engine Leakage:** Model targets and predictions are strictly isolated from feature engineering pipelines (audited in [docs/FINAL_CROSS_ENGINE_AUDIT.md](file:///f:/AI%20Business%20Advisor/docs/FINAL_CROSS_ENGINE_AUDIT.md)).
- **Secret Governance:** API keys and environment variables are loaded securely from root `.env` with automatic secret redaction in server logs.

---

## 📄 License & Attribution
GramBiz AI Business Advisor © 2026. Built with Python, FastAPI, Streamlit, and Gemini.
