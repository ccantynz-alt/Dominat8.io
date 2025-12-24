import { NextResponse } from "next/server";
import { KV } from "../../../../lib/kv";
import { keys } from "../../../../lib/keys";
import { getCurrentUserId } from "../../../../lib/demoAuth";
import { RunSchema } from "../../../../lib/models/run";
import { RunLogSchema } from "../../../../lib/models/log";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { runId: string } }
) {
  const ownerId = getCurrentUserId();

  const runRaw = await KV.get(keys.run(params.runId));
  if (!runRaw) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const run = RunSchema.parse(runRaw);
  if (run.ownerId !== ownerId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 500);

  const logsRaw = (await KV.lrange(keys.runLogs(params.runId), -limit, -1)) as any[];
  const logs = logsRaw
    .map((x) => RunLogSchema.safeParse(x))
    .filter((r) => r.success)
    .map((r) => (r as any).data);

  return NextResponse.json({ ok: true, logs });
}
