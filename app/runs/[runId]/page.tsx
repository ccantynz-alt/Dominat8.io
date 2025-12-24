import { NextResponse } from "next/server";
import { KV } from "../../../lib/kv";
import { keys } from "../../../lib/keys";
import { getCurrentUserId } from "../../../lib/demoAuth";
import { RunSchema } from "../../../lib/models/run";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const ownerId = getCurrentUserId();
  const run = await KV.get(keys.run(params.runId));

  if (!run) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const parsed = RunSchema.safeParse(run);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Corrupt run data" },
      { status: 500 }
    );
  }

  if (parsed.data.ownerId !== ownerId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, run: parsed.data });
}
