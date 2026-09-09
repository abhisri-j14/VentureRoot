"""
CLI Evaluation Script for GramBiz RAG Knowledge System.
Run: python scripts/evaluate.py
"""

import sys
import json
from pathlib import Path

# Add src to path
RAG_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAG_DIR))

from src.pipeline import RAGPipeline
from src.evaluation.evaluator import RAGEvaluator

def main():
    print("==================================================")
    print(" GramBiz RAG Evaluation Framework Starting...")
    print("==================================================")
    
    pipeline = RAGPipeline()
    evaluator = RAGEvaluator(pipeline)
    results = evaluator.run_evaluation()
    
    print("\nEvaluation Results Summary:")
    print(json.dumps(results, indent=2))
    print("\nEvaluation Completed Successfully!")

if __name__ == "__main__":
    main()
