export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { dequeueRun, getRun, appendRunLog, updateRunStatus } from "../../../lib/store";

export async function GET() {
  try {
    // If KV env vars are missing, dequeueRun() will throw (from kv.ts).
    const id = await dequeueRun();

    if (!id) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        note: "Queue empty (no runs to process)",
      });
    }

    const run = await getRun(id);
    if (!run) {
      return NextResponse.json({
        ok: true,
        processed: 1,
        warning: `Dequeued run id ${id} but run record not found`,
      });
    }

    await updateRunStatus(id, "running");
    await appendRunLog(id, "✅ cron tick picked up this run");
    await updateRunStatus(id, "succeeded", { output: { note: "Processed by simplified tick" } });

    return NextResponse.json({ ok: true, processed: 1, runId: id });
  } catch (err: any) {
    // ✅ Return the actual reason instead of a blank 500
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unknown error",
        hint:
          "Most common cause: KV_REST_API_URL / KV_REST_API_TOKEN not set for Production in Vercel env vars.",
      },
      { status: 500 }
    );
  }
}
