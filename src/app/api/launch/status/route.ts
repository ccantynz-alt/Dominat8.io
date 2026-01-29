import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/launch/store";
import { getLatestStatus } from "@/lib/launch/orchestrator";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const auth = requireAdminToken(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: auth.status });
  const status = await getLatestStatus();
  return NextResponse.json({ ok: true, stamp: "APL1_STATUS_20260129", status });
}