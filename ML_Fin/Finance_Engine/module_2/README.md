# GramBiz Module 2 — Smart Financial Calculator & Scheme Router

## 1. Project Purpose
GramBiz is a Hyper-Local AI Business Advisory Assistant designed for Smart India Hackathon (SIH). It empowers first-time rural and semi-urban entrepreneurs by transforming complex government credit schemes into transparent, actionable financial roadmaps.

## 2. Module 2 Scope
Module 2 is an independent, deterministic financial engine that calculates:
- Supported project cost based on available beneficiary margin capital.
- Scheme eligibility and loan caps (Micro Finance vs. Term Loan).
- Equated Monthly Installments (EMI).
- Monthly and quarterly amortization schedules.
- Moratorium grace period handling with accrued interest capitalization.
- Working capital, operational costs, and contingency reserves.
- Detailed PDF and CSV financial reports.

> **STRICT RULE**: All financial calculations are 100% mathematical and deterministic. All scheme rules, rates, limits, and terms are strictly defined in `finance_engine/constants.py`. No AI/LLM model is used for calculations.

---

## 3. Architecture
```
Frontend (Streamlit / Mobile App)
          ↓
  FastAPI Service (API Layer)
          ↓
  FinanceEngine Core Package
 (Deterministic Calculations)
```

The `finance_engine` is built as a reusable, decoupled Python package. Both the FastAPI REST server and the Streamlit demo application import `finance_engine` directly.

---

## 4. Folder Structure
```
f:\AI Business Advisor\module_2\
├── finance_engine\
│   ├── __init__.py
│   ├── constants.py           # Scheme definitions, rates, caps, categories
│   ├── models.py              # Pydantic schemas
│   ├── validation.py          # Input validation and warning logic
│   ├── schemes.py             # SchemeRouter (Micro Finance vs Term Loan vs >₹50L)
│   ├── emi.py                 # Mathematical EMI calculator
│   ├── repayment.py           # Monthly amortization schedule & quarterly aggregation
│   ├── working_capital.py     # Working capital & operational cost engine
│   ├── calculator.py          # Master FinanceCalculator orchestrator
│   └── utils.py               # Currency formatting (INR) & precision rounding
│
├── api\
│   ├── __init__.py
│   └── main.py                # FastAPI REST endpoints (/health, /api/v1/finance/...)
│
├── streamlit_app\
│   ├── app.py                 # Streamlit entrypoint & sidebar
│   ├── pages\
│   │   ├── 01_Financial_Calculator.py   # Margin & loan calculator page
│   │   ├── 02_Scheme_Comparison.py      # Scheme rules comparison
│   │   ├── 03_Repayment_Schedule.py      # Monthly/Quarterly schedules & Plotly charts
│   │   ├── 04_Working_Capital.py        # Working capital assessment form
│   │   └── 05_Financial_Report.py       # Consolidated report, PDF & CSV export
│   ├── components\
│   ├── styles\
│   │   └── custom.css         # Professional white theme CSS
│   └── utils\
│       └── pdf_generator.py   # ReportLab PDF report generator
│
├── tests\
│   ├── __init__.py
│   ├── test_calculator.py      # Core requirements test cases (Tests 1-6)
│   ├── test_scheme_router.py   # Scheme routing boundary tests
│   ├── test_emi.py            # EMI precision tests (Test 7)
│   ├── test_repayment.py      # Moratorium capitalization & zero balance tests (Tests 8-9)
│   └── test_working_capital.py# Working capital tests (Test 10)
│
├── requirements.txt           # Consolidated dependencies
├── requirements-api.txt       # FastAPI dependencies
├── requirements-streamlit.txt # Streamlit dependencies
├── Dockerfile                 # Render deployment container setup
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore patterns
└── README.md                  # Comprehensive documentation
```

---

## 5. Installation
Create and activate the virtual environment `.venv`:

```bash
# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r module_2/requirements.txt
```

---

## 6. Environment Variables
Copy `.env.example` to `.env`:

```env
APP_ENV=development
FINANCE_API_HOST=0.0.0.0
FINANCE_API_PORT=8000
STREAMLIT_PORT=8501
DEFAULT_CURRENCY=INR
FINANCE_ENGINE_URL=https://your-finance-engine.onrender.com
```

---

## 7. Running FastAPI Backend
Start the FastAPI server using Uvicorn inside `.venv`:

```bash
.\.venv\Scripts\python -m uvicorn module_2.api.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Health Check**: `http://localhost:8000/health`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 8. Running Streamlit App
Launch the GramBiz Finance Streamlit testing dashboard:

```bash
.\.venv\Scripts\python -m streamlit run module_2/streamlit_app/app.py
```

Access UI at `http://localhost:8501`.

---

## 9. API Endpoints List
- `GET /health`: Health check endpoint.
- `POST /api/v1/finance/calculate`: Complete financial planning calculation.
- `POST /api/v1/finance/emi`: Quick EMI calculation.
- `POST /api/v1/finance/repayment-schedule`: Full repayment schedule.
- `POST /api/v1/finance/working-capital`: Operational expenses & working capital calculation.
- `POST /api/v1/finance/scheme`: Scheme determination for a given project cost.
- `GET /api/v1/schemes`: Detailed information on available credit schemes.

---

## 10. Example cURL Request

```bash
curl -X POST "http://localhost:8000/api/v1/finance/calculate" \
     -H "Content-Type: application/json" \
     -d '{
           "available_margin": 100000,
           "business_category": "Dairy"
         }'
```

---

## 11. Example API Response

```json
{
  "available_margin": 100000.0,
  "calculated_project_cost": 1000000.0,
  "beneficiary_contribution": 100000.0,
  "calculated_loan": 900000.0,
  "eligible_loan": 900000.0,
  "is_within_scheme_limit": true,
  "scheme": {
    "scheme_id": "term_loan",
    "name": "Term Loan Scheme",
    "min_project_cost": 140000.0,
    "max_project_cost": 5000000.0,
    "beneficiary_contribution_pct": 0.1,
    "loan_percentage": 0.9,
    "max_loan": 4500000.0,
    "interest_rate": 0.08,
    "tenure_years": 7,
    "tenure_months": 84,
    "moratorium_months": 6
  },
  "interest_rate": 0.08,
  "tenure_years": 7,
  "tenure_months": 84,
  "moratorium_months": 6,
  "monthly_emi": 15438.24,
  "effective_principal_after_moratorium": 936605.36,
  "total_interest": 304182.44,
  "total_repayment": 1204182.44,
  "warnings": [],
  "repayment_assumption_note": "Repayment assumption: The stated tenure includes the moratorium period. Interest accrued during the moratorium is capitalized before EMI repayment begins. Actual lender terms may vary.",
  "financial_disclaimer": "This tool provides an indicative financial calculation based on the scheme parameters configured in GramBiz. Actual sanction, interest calculation, moratorium treatment, repayment schedule and eligibility are subject to the financing agency's applicable rules and final approval."
}
```

---

## 12. Financial Formulas

1. **Project Cost from Margin**:
   $$\text{Project Cost} = \frac{\text{Available Margin}}{0.10}$$

2. **Eligible Loan**:
   $$\text{Eligible Loan} = \min(\text{Project Cost} \times 0.90, \text{Scheme Max Loan Cap})$$

3. **Monthly Interest Rate**:
   $$r = \frac{\text{Annual Interest Rate}}{12}$$

4. **Equated Monthly Installment (EMI)**:
   $$\text{EMI} = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$$
   *(where $P$ is principal balance after moratorium capitalization, and $n$ is post-moratorium months)*.

5. **Working Capital Requirement**:
   $$\text{Working Capital} = \text{Monthly Operating Expenses} \times \text{Coverage Months}$$

---

## 13. Scheme Routing Logic

- **Micro Finance Scheme**:
  - `Project Cost <= ₹1,40,000`
  - Margin: 10%, Agency Financing: 90% (Max loan cap: ₹1,25,000)
  - Interest: 6.5% p.a., Tenure: 3 years (36 months), Moratorium: 3 months
- **Term Loan Scheme**:
  - `Project Cost > ₹1,40,000` and `<= ₹50,00,000`
  - Margin: 10%, Agency Financing: 90% (Max loan cap: ₹45,00,000)
  - Interest: 8.0% p.a., Tenure: 7 years (84 months), Moratorium: 6 months
- **Outside Scheme Range**:
  - `Project Cost > ₹50,00,000`
  - Display warning: *"Project cost exceeds the maximum ₹50 lakh scheme limit."*

---

## 14. Moratorium Assumption & Financial Disclaimer
- **Repayment Assumption**: *"Repayment assumption: The stated tenure includes the moratorium period. Interest accrued during the moratorium is capitalized before EMI repayment begins. Actual lender terms may vary."*
- **Official Disclaimer**: *"This tool provides an indicative financial calculation based on the scheme parameters configured in GramBiz. Actual sanction, interest calculation, moratorium treatment, repayment schedule and eligibility are subject to the financing agency's applicable rules and final approval."*

---

## 15. Testing
Execute unit tests using Pytest in `.venv`:

```bash
.\.venv\Scripts\python -m pytest module_2/tests/ -v
```

---

## 16. Render Deployment
The service is containerized for Render deployment.

1. **Build Docker image**:
   ```bash
   docker build -t grambiz-finance-engine -f module_2/Dockerfile .
   ```
2. **Run locally via Docker**:
   ```bash
   docker run -p 8000:8000 grambiz-finance-engine
   ```
3. **Deploy to Render**:
   - Create a Web Service on Render pointing to `module_2/Dockerfile`.
   - Set environment variable `PORT=8000`.
   - Render health check endpoint: `GET /health` (returns HTTP 200).

---

## 17. Future Integration with Module 1 & Main Backend
In future phases, the main system backend will invoke Module 2 via environment variable:

```env
FINANCE_ENGINE_URL=https://your-finance-engine.onrender.com
```

The main backend makes REST POST calls to `${FINANCE_ENGINE_URL}/api/v1/finance/calculate`. Module 2 is fully decoupled and does not require modifications when Module 1 ML models are added.
