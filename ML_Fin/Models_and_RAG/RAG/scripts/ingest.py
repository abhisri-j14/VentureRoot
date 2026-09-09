"""
CLI Ingestion Script for GramBiz RAG Knowledge System.
Run: python scripts/ingest.py
"""

import sys
import json
from pathlib import Path

# Add src to path
RAG_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAG_DIR))

from src.pipeline import RAGPipeline

def main():
    print("==================================================")
    print(" GramBiz RAG Ingestion Pipeline Starting...")
    print("==================================================")
    
    pipeline = RAGPipeline()
    report = pipeline.ingest_documents_from_directory()
    
    print("\nIngestion Summary Report:")
    print(json.dumps(report, indent=2))
    print("\nIngestion Completed Successfully!")

if __name__ == "__main__":
    main()
