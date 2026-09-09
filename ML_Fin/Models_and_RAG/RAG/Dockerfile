FROM python:3.10-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir fastapi uvicorn pydantic scikit-learn numpy pypdf streamlit pytest httpx

EXPOSE 8004

CMD ["python", "api/main.py"]
