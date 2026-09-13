"""
Gemini-Powered Agentic Business Regulation Verification System.

Architecture:
  1. RAG Retrieval: BAAI/bge-large-en-v1.5 embeds the business context query
     and retrieves the top-K most relevant regulation chunks from ChromaDB.
  2. Gemini Agent:  google-generativeai (gemini-2.5-flash) synthesizes
     retrieved rules against ML model predictions to issue a structured verdict.

Verdict types:
  - VERIFIED       – Prediction complies with all retrieved regulations.
  - FLAG_WARNING   – Prediction has potential compliance concerns.
  - REJECTED       – Prediction contradicts mandatory regulations.
"""

import os
from pathlib import Path
from typing import Optional
from google import genai
from google.genai import types as genai_types

# Load .env file from the RAG service root so GEMINI_API_KEY is available locally
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    load_dotenv(dotenv_path=_env_path, override=False)
except ImportError:
    pass  # dotenv optional — Render injects env vars directly

from .retriever import get_retriever

# ──────────────────────────────────────────────────────────────
# Gemini Configuration
# ──────────────────────────────────────────────────────────────
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
]


def _get_genai_client() -> genai.Client:
    """Create a google.genai Client with the API key from environment."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set. "
            "Add it to ML_Fin/Models_and_RAG/RAG/.env (local) "
            "or to your Render environment variables."
        )
    return genai.Client(api_key=api_key)


def _build_verification_prompt(
    business_context: dict,
    ml_predictions: dict,
    retrieved_chunks: list[dict],
) -> str:
    """
    Build the structured verification prompt for the Gemini agent.

    Includes:
      - All retrieved regulation chunks with source citations.
      - The ML prediction to verify.
      - Structured instructions for producing a JSON-compatible verdict.
    """

    # Format retrieved regulations with citations
    regulations_block = ""
    for chunk in retrieved_chunks:
        regulations_block += (
            f"\n---\n"
            f"📖 SOURCE: {chunk['document_name']} | SECTION: {chunk['topic']} "
            f"| RELEVANCE: {round(chunk['score'] * 100, 1)}%\n"
            f"{chunk['text']}\n"
        )

    # Build business context summary
    biz_name = business_context.get("businessName", business_context.get("name", "Proposed Business"))
    category = business_context.get("category", "Unknown Category")
    location = business_context.get("location", "India")
    investment = business_context.get("investment", business_context.get("expectedInvestment", 0))
    margin = business_context.get("margin", business_context.get("availableMargin", 0))

    # Summarize ML predictions
    pred_summary = "\n".join(
        f"  • {k.replace('_', ' ').title()}: {v}"
        for k, v in ml_predictions.items()
    )

    prompt = f"""You are the **VentureRoot Regulatory Compliance Verification Agent** — an expert agentic AI system specializing in Indian business law, financial regulations, rural enterprise compliance, and government scheme verification.

Your task is to verify the ML model's business predictions against the authoritative regulations retrieved from the VentureRoot business regulation knowledge base.

═══════════════════════════════════════════════════════════════
📋 BUSINESS CONTEXT UNDER REVIEW
═══════════════════════════════════════════════════════════════
Business Name    : {biz_name}
Category         : {category}
Location         : {location}
Total Investment : ₹{int(investment):,}
Promoter Margin  : ₹{int(margin):,}

═══════════════════════════════════════════════════════════════
🤖 ML MODEL PREDICTIONS TO VERIFY
═══════════════════════════════════════════════════════════════
{pred_summary}

═══════════════════════════════════════════════════════════════
📚 RETRIEVED AUTHORITATIVE REGULATIONS (RAG)
═══════════════════════════════════════════════════════════════
{regulations_block}

═══════════════════════════════════════════════════════════════
🎯 VERIFICATION INSTRUCTIONS & VERDICT RULES
═══════════════════════════════════════════════════════════════
Analyze each ML prediction against the retrieved regulations above. For each prediction:

1. **FINANCIAL COMPLIANCE** — Does the investment, subsidy, or loan amount comply with regulatory caps (PMEGP, MUDRA, PMFME, NABARD limits)?
2. **SCHEME ELIGIBILITY** — Is the business category eligible for the predicted schemes? Check enterprise type, location (rural/urban), and project cost criteria.
3. **OPERATIONAL REGULATIONS** — Are there any mandatory licensing, registration, or compliance requirements the prediction should account for (Udyam, FSSAI, trade license, etc.)?
4. **RISK FLAGS** — Identify any regulatory risks, cap violations, or missing compliance steps.
5. **CITATIONS** — For every finding, cite the exact source document and section name from the retrieved regulations.

CRITICAL VERDICT & SCORING RULES:
- **VERIFIED** (Compliance Score 60-100): Assigned when business parameters satisfy scheme limits, financial caps, and margin rules with NO direct statutory violations. Routine operational steps (e.g., Udyam Registration, FSSAI Category, State PCB NOC, Municipal Trade License) are standard administrative prerequisites and MUST NOT downgrade the verdict to FLAG_WARNING if market/financial compliance is proper.
- **FLAG_WARNING** (Compliance Score 40-59): Assigned ONLY when there are actual near-cap overruns, questionable scheme eligibility, or significant financial risk flags.
- **REJECTED** (Compliance Score 0-39): Assigned ONLY when there is a direct statutory contradiction, illegal parameter allocation, or total scheme ineligibility.

═══════════════════════════════════════════════════════════════
📝 OUTPUT FORMAT (REQUIRED — Professional Audit Markdown)
═══════════════════════════════════════════════════════════════
Respond ONLY in this exact structured format:

**VERDICT: [VERIFIED | FLAG_WARNING | REJECTED]**

**Compliance Score: [0-100]/100**

---

### ✅ Verified Findings
* **[Compliant Domain/Rule Name]**: [Concise regulatory verification finding, referencing applicable statutory guidelines and citing source]
* **[Compliant Domain/Rule Name]**: [Concise regulatory verification finding, referencing applicable statutory guidelines and citing source]

### ⚠️ Warnings & Flags
* **[Risk/Advisory Flag Name]**: [Specific concern, near-cap threshold, or requirement needing verification]
  * **[Prerequisite/License Name]**: [Mandatory operational filing, e.g. Udyam Registration, FSSAI Category, State PCB NOC, or Municipal Trade License]

### ❌ Violations (if any)
* [If none found, write: **Zero Direct Statutory Violations**: No direct violations of known statutory limits or illegal parameter allocations were detected based on the retrieved regulations.]
* [If violations found: **[Violation Type]**: Direct statutory contradiction or ceiling violation]

### 📚 Regulatory Citations
* [Source Document Name] | SECTION: [Section/Topic Name] | "[Key statutory rule, clause, or regulatory sentence applied]"

### 💡 Verification Summary
* **Executive Assessment**: [2-3 sentence authoritative executive summary of compliance status, risks, and recommended next clearance steps for the promoter and lending institution.]
"""

    return prompt


def run_verification(
    business_context: dict,
    ml_predictions: dict,
    top_k: int = 5,
    topic_filter: Optional[str] = None,
) -> dict:
    """
    Full agentic verification pipeline.

    Args:
        business_context: Dict with keys: businessName, category, location,
                          investment, margin, and any other business fields.
        ml_predictions:   Dict of ML model outputs (scores, recommendations,
                          financial projections, scheme suggestions, etc.)
        top_k:            Number of regulation chunks to retrieve.
        topic_filter:     Optional topic string to filter retrieved chunks.

    Returns:
        Dict with keys:
          - verdict: str ("VERIFIED" | "FLAG_WARNING" | "REJECTED")
          - compliance_score: int (0-100)
          - verification_report: str (full structured markdown)
          - citations: list[dict] (document, topic, score, excerpt)
          - retrieved_chunks_count: int
          - model_used: str
    """

    _get_genai_client()  # validate API key before retrieval
    retriever = get_retriever()

    # ── Step 1: Build composite query for retrieval ─────────────────────
    category = business_context.get("category", "Micro-Enterprise")
    location = business_context.get("location", "India")
    scheme = ml_predictions.get("recommended_scheme", "PMEGP")
    cost = ml_predictions.get("total_project_cost", "")

    rag_query = (
        f"{category} statutory regulations and government compliance in {location}. "
        f"{scheme} scheme eligibility criteria, capital subsidy percentages, "
        f"maximum project cost limits {cost}, promoter margin requirements, "
        f"mandatory operational licensing (FSSAI, Udyam, trade licenses), "
        f"and environmental permissions."
    )

    # ── Step 2: Retrieve relevant regulation chunks ─────────────────────
    print(f"[Agent] Retrieving top-{top_k} regulation chunks...")
    retrieved_chunks = retriever.search(
        query=rag_query,
        top_k=top_k,
        topic_filter=topic_filter,
    )

    if not retrieved_chunks:
        return {
            "verdict": "FLAG_WARNING",
            "compliance_score": 50,
            "verification_report": (
                "⚠️ No relevant regulation chunks were retrieved from the knowledge base. "
                "Manual compliance verification is recommended."
            ),
            "citations": [],
            "retrieved_chunks_count": 0,
            "model_used": GEMINI_MODELS[0],
        }

    # ── Step 3: Build Gemini verification prompt ────────────────────────
    prompt = _build_verification_prompt(
        business_context=business_context,
        ml_predictions=ml_predictions,
        retrieved_chunks=retrieved_chunks,
    )

    # ── Step 4: Call Gemini Agent ───────────────────────────────────────
    client = _get_genai_client()
    models_to_try = GEMINI_MODELS
    last_error = None
    verification_text = None
    model_used = None

    for model_name in models_to_try:
        try:
            print(f"[Agent] Calling Gemini model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=3000,
                    top_p=0.9,
                ),
            )
            verification_text = response.text
            model_used = model_name
            break
        except Exception as e:
            print(f"[Agent] {model_name} failed: {e}")
            last_error = e

    if not verification_text:
        raise RuntimeError(
            f"All Gemini models failed. Last error: {last_error}"
        )

    # ── Step 5: Parse verdict from structured response ──────────────────
    verdict = "FLAG_WARNING"  # safe default
    if "VERDICT: VERIFIED" in verification_text.upper():
        verdict = "VERIFIED"
    elif "VERDICT: REJECTED" in verification_text.upper():
        verdict = "REJECTED"
    elif "VERDICT: FLAG_WARNING" in verification_text.upper():
        verdict = "FLAG_WARNING"

    # Parse compliance score
    compliance_score = 70  # safe default
    import re
    score_match = re.search(r"Compliance Score:\s*(\d+)\s*/\s*100", verification_text)
    if score_match:
        compliance_score = int(score_match.group(1))

    # Safeguard: If market/financial compliance is proper (compliance_score >= 60)
    # and zero direct statutory violations exist, verdict MUST be VERIFIED.
    has_no_violations = (
        "zero direct statutory violation" in verification_text.lower()
        or "no direct violation" in verification_text.lower()
        or "zero violations" in verification_text.lower()
        or "no direct statutory contradiction" in verification_text.lower()
        or "### ❌ violations (if any)\n* **zero" in verification_text.lower()
    )
    if compliance_score >= 60 and verdict == "FLAG_WARNING" and has_no_violations:
        verdict = "VERIFIED"
        verification_text = re.sub(
            r"\*\*VERDICT:\s*FLAG_WARNING\*\*",
            "**VERDICT: VERIFIED**",
            verification_text,
            flags=re.IGNORECASE
        )

    # ── Step 6: Build citations list ─────────────────────────────────────
    citations = [
        {
            "rank": chunk["rank"],
            "relevance_score": chunk["score"],
            "relevance_percent": round(chunk["score"] * 100, 1),
            "document": chunk["document_name"].replace(".pdf", ""),
            "section": chunk["topic"],
            "excerpt": chunk["text"][:300] + "...",
            "source_type": chunk["source_type"],
        }
        for chunk in retrieved_chunks
    ]

    return {
        "verdict": verdict,
        "compliance_score": compliance_score,
        "verification_report": verification_text,
        "citations": citations,
        "retrieved_chunks_count": len(retrieved_chunks),
        "model_used": model_used,
    }
