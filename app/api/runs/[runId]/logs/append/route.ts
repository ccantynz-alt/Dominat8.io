import { NextResponse } from "next/server";
import { KV } from "../../../../../lib/kv";
import { keys } from "../../../../../lib/keys";
import { getCurrentUserId } from "../../../../../lib/demoAuth";
import { RunSchema } from "../../../../../lib/models/run";
import { RunLogSchema } from "../../../../../lib/models/log";

export const runtime = "nodejs";

export async function POST(
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

  const body = await req.json().catch(() => ({}));
  const entry = RunLogSchema.safeParse({
    ts: new Date().toISOString(),
    level: body.level ?? "info",
    message: String(body.message ?? ""),
    data: body.data ?? undefined,
  });

  if (!entry.success || !entry.data.message) {
    return NextResponse.json(
      { ok: false, error: "Invalid log entry" },
      { status: 400 }
    );
  }

  await KV.rpush(keys.runLogs(params.runId), entry.data);

  return NextResponse.json({ ok: true });
}
