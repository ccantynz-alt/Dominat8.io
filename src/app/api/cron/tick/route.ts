import { NextResponse } from "next/server";
import { dequeueRun, appendRunLog, updateRunStatus, getRun } from "../../../../lib/store";
import { nowIso } from "../../../../lib/time";

/**
 * Vercel Cron calls this endpoint.
 * It processes a small number of queued runs each tick to stay reliable.
 */
export async function GET() {
  const startedAt = nowIso();
  const processed: string[] = [];

  const MAX = 3;

  for (let i = 0; i < MAX; i++) {
    const id = await dequeueRun();
    if (!id) break;

    processed.push(id);

    const run = await getRun(id);
    if (!run) continue;

    await updateRunStatus(id, "running");
    await appendRunLog(id, `▶️ Started run (${run.kind}) "${run.title}"`);

    try {
      await appendRunLog(id, "🧠 Agent: analyzing input…");

      if (run.kind === "agent:deploy") {
        await appendRunLog(id, "🚀 Deploy runs via /api/vercel/deploy (trigger from UI).");
      } else if (run.kind === "agent:import") {
        await appendRunLog(id, "📦 Import runs via /api/github/import (trigger from UI).");
      } else if (run.kind === "agent:build") {
        await appendRunLog(id, "🏗️ Build agent placeholder (add Vercel/GitHub build tooling next).");
      } else if (run.kind === "agent:plan") {
        await appendRunLog(id, "📝 Planning placeholder (later: call /api/chat with system prompt).");
      } else {
        await appendRunLog(id, "✅ Maintenance placeholder completed.");
      }

      await updateRunStatus(id, "succeeded", { output: { finishedAt: nowIso() } });
      await appendRunLog(id, "✅ Run succeeded.");
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error";
      await updateRunStatus(id, "failed", { error: msg });
      await appendRunLog(id, `❌ Run failed: ${msg}`);
    }
  }

  return NextResponse.json({
    ok: true,
    startedAt,
    processedCount: processed.length,
    processed
  });
}
