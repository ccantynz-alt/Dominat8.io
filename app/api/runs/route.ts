import { NextResponse } from "next/server";
import { KV } from "../../lib/kv";
import { keys } from "../../lib/keys";
import { makeId } from "../../lib/ids";
import { getCurrentUserId } from "../../lib/demoAuth";
import { CreateRunInputSchema, RunSchema } from "../../lib/models/run";
import { RunLogSchema } from "../../lib/models/log";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ownerId = getCurrentUserId();

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");

  const indexKey = projectId
    ? keys.runIdsByProject(projectId)
    : keys.runIdsByOwner(ownerId);

  const ids = (await KV.zrange(indexKey, 0, 49, { rev: true })) as string[];

  const runs = [];
  for (const id of ids) {
    const r = await KV.get(keys.run(id));
    if (!r) continue;
    const parsed = RunSchema.safeParse(r);
    if (parsed.success && parsed.data.ownerId === ownerId) runs.push(parsed.data);
  }

  return NextResponse.json({ ok: true, runs });
}

export async function POST(req: Request) {
  const ownerId = getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const parsedInput = CreateRunInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", issues: parsedInput.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const runId = makeId("run");

  const run = {
    id: runId,
    ownerId,
    projectId: parsedInput.data.projectId,
    title: parsedInput.data.title,
    input: parsedInput.data.input,
    status: "queued" as const,
    createdAt: now,
    updatedAt: now,
  };

  await KV.set(keys.run(runId), run);

  await KV.zadd(keys.runIdsByOwner(ownerId), {
    score: Date.now(),
    member: runId,
  });
  await KV.zadd(keys.runIdsByProject(run.projectId), {
    score: Date.now(),
    member: runId,
  });

  const log = RunLogSchema.parse({
    ts: now,
    level: "info",
    message: "Run created (queued).",
    data: { projectId: run.projectId },
  });
  await KV.rpush(keys.runLogs(runId), log);

  const validated = RunSchema.parse(run);
  return NextResponse.json({ ok: true, run: validated });
}
