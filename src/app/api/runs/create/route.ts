import { NextResponse } from "next/server";
import { uid } from "../../../../lib/ids";
import { nowIso } from "../../../../lib/time";
import type { Run, RunKind } from "../../../../lib/types";
import { enqueueRun, saveRun } from "../../../../lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = (body.kind as RunKind) ?? "agent:plan";
  const title = (body.title as string) ?? "New run";
  const input = (body.input as Record<string, any> | undefined) ?? undefined;

  const run: Run = {
    id: uid("run"),
    kind,
    title,
    input,
    status: "queued",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  await saveRun(run);
  await enqueueRun(run.id);

  return NextResponse.json({ ok: true, run });
}
