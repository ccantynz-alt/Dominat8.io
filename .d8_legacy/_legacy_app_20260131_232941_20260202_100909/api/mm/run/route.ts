/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   POST /api/mm/run — orchestrator (Core v1 = event-only safe execution)
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/
import { NextResponse } from "next/server";
import { mmAppend, mmSetLastRun } from "@/lib/d8/mm/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function step(name: string, msg: string, meta: any = {}) {
  await mmAppend({ level: "info", type: "agent.step", msg, meta: { step: name, ...meta } });
  await new Promise((r) => setTimeout(r, 40));
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const mode = String(body?.mode || "dry");

  const runId = "run_" + Date.now().toString(16);
  const startedAt = new Date().toISOString();

  await mmAppend({ level: "info", type: "run.start", msg: "Marketing Machine run started", meta: { runId, mode, stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831" } });

  await step("seo.refresh",    "SEO refresh pass queued",      { runId });
  await step("sitemap.regen",  "Sitemap regeneration queued",  { runId });
  await step("links.internal", "Internal linking pass queued", { runId });
  await step("content.draft",  "Landing page draft queued",    { runId });

  const summary = {
    ok: true,
    runId,
    mode,
    stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831",
    proof: "D8_MONSTER_MM_PROOF_20260131_232831",
    startedAt,
    finishedAt: new Date().toISOString(),
    steps: ["seo.refresh", "sitemap.regen", "links.internal", "content.draft"],
    note: "Core v1 is event-only. Core v2 will add real agent execution + publish gate behind guardrails.",
  };

  await mmSetLastRun(summary);
  await mmAppend({ level: "info", type: "run.done", msg: "Marketing Machine run complete", meta: summary });

  const res = NextResponse.json(summary);
  res.headers.set("cache-control", "no-store, max-age=0");
  res.headers.set("x-mm-run", runId);
  return res;
}