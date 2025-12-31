// app/api/cron/tick/route.ts
import { NextResponse } from "next/server";
import {
  dequeueRunId,
  getRun,
  setRun,
  appendRunLog,
  claimRunLock,
} from "@/app/lib/runs";

async function executeRun(runId: string) {
  await appendRunLog(runId, "Worker claimed run.");
  await appendRunLog(runId, "Starting execution...");
  await new Promise((r) => setTimeout(r, 400));
  await appendRunLog(runId, "Step 1: reasoning");
  await new Promise((r) => setTimeout(r, 400));
  await appendRunLog(runId, "Step 2: producing output");
  await new Promise((r) => setTimeout(r, 400));
  await appendRunLog(runId, "Run complete.");
}

export async function POST(req: Request) {
  // 🔒 Stabilization gate
  const enabled = (process.env.CRON_ENABLED ?? "").toLowerCase() === "true";
  if (!enabled) {
    return NextResponse.json({
      ok: true,
      message: "Cron disabled (set CRON_ENABLED=true)",
    });
  }

  // 🔒 Auth gate
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("x-cron-secret");
  if (secret && header !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const max = 3; // keep small to avoid timeouts
  let processed = 0;

  for (let i = 0; i < max; i++) {
    const runId = await dequeueRunId();
    if (!runId) break;

    const locked = await claimRunLock(runId, 90);
    if (!locked) continue;

    const run = await getRun(runId);
    if (!run || run.status !== "queued") continue;

    processed++;

    await setRun(runId, { status: "running", startedAt: new Date().toISOString() });

    try {
      await executeRun(runId);
      await setRun(runId, { status: "done", finishedAt: new Date().toISOString() });
    } catch (e: any) {
      await appendRunLog(runId, `Error: ${e?.message ?? "unknown"}`);
      await setRun(runId, {
        status: "failed",
        finishedAt: new Date().toISOString(),
        error: e?.message ?? "unknown",
      });
    }
  }

  return NextResponse.json({ ok: true, processed });
}
