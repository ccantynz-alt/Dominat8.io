import { NextResponse } from "next/server";
import { allowApply, requireAdminToken } from "@/lib/launch/store";
import { runApl } from "@/lib/launch/orchestrator";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: auth.status });
  let body: any = {}; try { body = await req.json(); } catch { body = {}; }
  const mode = (body?.mode || "plan").toString();
  if (mode === "apply") {
    const gate = allowApply(req);
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason, mode }, { status: gate.status });
  }
  const result = await runApl({ projectId: body?.projectId || "demo", mode: mode === "apply" ? "apply" : "plan", goal: body?.goal || "Launch Dominat8 demo" });
  return NextResponse.json({ ok: true, stamp: "APL1_OK_20260129", mode: result.mode, runId: result.runId, proofKey: result.proofKey, plan: result.plan, outputs: result.outputs });
}