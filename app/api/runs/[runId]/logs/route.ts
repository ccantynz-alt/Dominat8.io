// app/api/runs/[runId]/logs/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";

type RunLog = { ts: string; level: "info" | "error"; msg: string };

function runLogsKey(runId: string) {
  return `runs:${runId}:logs`;
}

export async function GET(_req: Request, ctx: { params: { runId: string } }) {
  const logs = (await kvJsonGet<RunLog[]>(runLogsKey(ctx.params.runId))) ?? [];
  return NextResponse.json({ ok: true, logs });
}
