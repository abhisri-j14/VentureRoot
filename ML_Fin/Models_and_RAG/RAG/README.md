# GramBiz RAG Knowledge System

The **GramBiz RAG Knowledge System** provides authoritative, verified information on Indian government schemes, subsidies, APMC regulations, and compliance requirements for micro-enterprises.

## Quick Start

### 1. Ingest Documents
```bash
python scripts/ingest.py
```

### 2. Run Evaluation
```bash
python scripts/evaluate.py
```

### 3. Run FastAPI Microservice (Port 8004)
```bash
python api/main.py
```

### 4. Run Streamlit Interactive UI
```bash
streamlit run streamlit_app/app.py
```

### 5. Run Test Suite
```bash
pytest tests/
```
