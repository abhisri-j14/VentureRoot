# Production Dockerfile for GramBiz Finance Engine API (Render Deployment)
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements-api.txt ./requirements-api.txt
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy module source files
COPY finance_engine/ ./finance_engine/
COPY api/ ./api/

# Set Python path
ENV PYTHONPATH=/app

# Expose default port
EXPOSE 8000

# Render dynamically sets PORT environment variable
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
