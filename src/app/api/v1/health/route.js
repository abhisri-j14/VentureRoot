import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "VentureRoot API is running",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
}