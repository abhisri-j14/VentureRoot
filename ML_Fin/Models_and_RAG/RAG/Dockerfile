FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for sentence-transformers and chromadb C++ extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ build-essential libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy entire RAG service
COPY . /app

# Pre-download BAAI/bge-large-en-v1.5 model weights during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-large-en-v1.5')"

EXPOSE 8004

CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8004}"]