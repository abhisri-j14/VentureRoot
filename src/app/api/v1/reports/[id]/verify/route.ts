/**
 * Next.js proxy route: POST /api/v1/reports/[id]/verify
 *
 * Bridges the Next.js frontend to the Python RAG + Gemini verification
 * FastAPI microservice running at http://127.0.0.1:8006/api/v1/verify.
 *
 * It extracts business context and ML prediction data from the report,
 * and forwards them to the RAG service for agentic regulatory verification.
 */

import { NextRequest, NextResponse } from "next/server";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8006";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body may be empty — defaults applied below
  }

  const {
    business_context = {},
    ml_predictions = {},
    top_k = 5,
    topic_filter = null,
  } = body as {
    business_context?: Record<string, unknown>;
    ml_predictions?: Record<string, unknown>;
    top_k?: number;
    topic_filter?: string | null;
  };

  const payload = {
    business_context,
    ml_predictions,
    top_k,
    topic_filter,
    report_id: reportId,
  };

  try {
    const ragRes = await fetch(`${RAG_SERVICE_URL}/api/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 30-second timeout — Gemini call can take a few seconds
      signal: AbortSignal.timeout(30_000),
    });

    if (!ragRes.ok) {
      const errorText = await ragRes.text();
      return NextResponse.json(
        { error: `RAG verification service error: ${errorText}` },
        { status: ragRes.status }
      );
    }

    const result = await ragRes.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.includes("timeout") || message.includes("AbortError");

    if (isTimeout) {
      return NextResponse.json(
        { error: "Verification timed out — the RAG service took too long. Please retry." },
        { status: 504 }
      );
    }

    // Service not reachable (RAG FastAPI not started)
    return NextResponse.json(
      {
        error:
          "RAG verification service is offline. Start it with: python ML_Fin/run_ml_services.py",
        detail: message,
      },
      { status: 503 }
    );
  }
}
