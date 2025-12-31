// app/api/runs/[runId]/route.ts
import { NextResponse } from "next/server";
import { getRun } from "../../../../lib/runs";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const run = await getRun(params.runId);
  if (!run) return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });

  const logs = await getRunLogs(params.runId, 300);
  return NextResponse.json({ ok: true, run, logs });
}
