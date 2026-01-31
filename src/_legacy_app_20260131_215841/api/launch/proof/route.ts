import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/launch/store";
import { getLatestProof, getProofByRunId } from "@/lib/launch/orchestrator";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const auth = requireAdminToken(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: auth.status });
  const url = new URL(req.url);
  const runId = (url.searchParams.get("runId") || "").trim();
  const proof = runId ? await getProofByRunId(runId) : await getLatestProof();
  return NextResponse.json({ ok: true, stamp: "APL1_PROOF_20260129", proof });
}