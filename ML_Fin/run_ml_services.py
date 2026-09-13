"""
GramBiz / VentureRoot -- Unified ML Microservice Orchestrator
=============================================================
Starts all required Python ML and data microservices concurrently in separate processes:
- Data Service / Census API (Port 8000)
- Model 1: Market Potential Engine (Port 8001)
- Model 2: Business Viability & Opportunity Engine (Port 8002)
- Model 3: Price Prediction Engine (Port 8003)
- AI Advisor: Advisory Agent Microservice (Port 8005)

Usage:
    python run_ml_services.py
"""

import os
import sys
import time
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

SERVICES = [
    {
        "name": "Data Intelligence & Scraping Service",
        "dir": ROOT_DIR / "web_scrapping",
        "cmd": [sys.executable, "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"],
        "port": 8000,
    },
    {
        "name": "Model 1 (Market Potential)",
        "dir": BASE_DIR / "Models_and_RAG" / "Model_1",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001"],
        "port": 8001,
    },
    {
        "name": "Model 2 (Business Viability)",
        "dir": BASE_DIR / "Models_and_RAG" / "Model_2",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8002"],
        "port": 8002,
    },
    {
        "name": "Model 3 (Price Prediction)",
        "dir": BASE_DIR / "Models_and_RAG" / "Model_3",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8003"],
        "port": 8003,
    },
    {
        "name": "Finance Engine (Scheme & Subsidies)",
        "dir": BASE_DIR / "Finance_Engine" / "module_2",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8004"],
        "port": 8004,
    },
    {
        "name": "AI Advisor (Gemini Agent)",
        "dir": BASE_DIR / "Models_and_RAG" / "AI_Advisor",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8005"],
        "port": 8005,
    },
    {
        "name": "RAG Knowledge & Verification Service",
        "dir": BASE_DIR / "Models_and_RAG" / "RAG",
        "cmd": [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8006"],
        "port": 8006,
    },
]


def main():
    print("=" * 60)
    print("Starting VentureRoot & GramBiz ML Microservice Cluster")
    print("=" * 60)

    processes = []
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BASE_DIR) + os.pathsep + env.get("PYTHONPATH", "")

    try:
        for svc in SERVICES:
            svc_dir = svc["dir"]
            if not svc_dir.exists():
                print(f"[-] Directory for {svc['name']} not found at {svc_dir}, skipping.")
                continue

            print(f"[+] Launching {svc['name']} on Port {svc['port']}...")
            proc = subprocess.Popen(
                svc["cmd"],
                cwd=str(svc_dir),
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            processes.append((svc["name"], proc, svc["port"]))

        print("\nAll ML microservices initiated:")
        for name, _, port in processes:
            print(f"  * {name}: http://127.0.0.1:{port}/health")

        print("\nPress Ctrl+C to terminate all ML services.\n")

        while True:
            time.sleep(1)
            for name, proc, port in processes:
                code = proc.poll()
                if code is not None:
                    print(f"[!] Warning: {name} (Port {port}) exited with code {code}")

    except KeyboardInterrupt:
        print("\n[+] Terminating all ML services...")
    finally:
        for name, proc, _ in processes:
            try:
                proc.terminate()
            except Exception:
                pass
        print("[✓] All ML services stopped.")


if __name__ == "__main__":
    main()
