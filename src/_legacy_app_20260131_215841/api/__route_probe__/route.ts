import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ ok: true, probe: "ROUTE_PROBE_OK_2026-01-30" });
}
