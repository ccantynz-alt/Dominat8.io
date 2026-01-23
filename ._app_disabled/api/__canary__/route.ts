import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    marker: "CANON_CANARY_app_api_v1_2026-01-19",
    nowIso: new Date().toISOString(),
  });
}
