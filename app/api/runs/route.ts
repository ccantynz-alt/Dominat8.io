// app/api/runs/route.ts
import { kv } from "../../lib/kv";
import { makeRunId } from "../../lib/ids";
import { requireDemoUser } from "../../lib/demoAuth";
import type { Run } from "../../lib/models/run";

export async function POST() {
  const user = await requireDemoUser();

  const runId = makeRunId();
  const now = Date.now();

  const run: Run = {
    id: runId,
    projectId: "demo-project", // or accept from body later
    createdAt: now,
    createdBy: user.id,
    status: "running",
    title: "Simulated Run",
  };

  // Example keys; keep using YOUR keys.ts conventions
  await kv.set(`run:${runId}`, run);
  await kv.lpush(`project:demo-project:runs`, runId);

  return NextResponse.json({ ok: true, runId });
}
