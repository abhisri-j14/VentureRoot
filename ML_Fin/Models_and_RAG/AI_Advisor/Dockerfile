FROM python:3.10-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir fastapi uvicorn pydantic httpx streamlit pytest

EXPOSE 8005

CMD ["python", "api/main.py"]
