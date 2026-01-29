import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/launch/store";
import { getLatestProof } from "@/lib/launch/orchestrator";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const auth = requireAdminToken(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: auth.status });
  const proof: any = await getLatestProof();
  const video = proof?.data?.outputs?.video || null;
  return NextResponse.json({ ok: true, stamp: "APL1_VIDEO_20260129", video });
}