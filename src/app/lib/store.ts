import { kv } from "./kv";
import type { Run, RunStatus } from "./types";
import { nowIso } from "./time";

const KEY_RUN = (id: string) => `run:${id}`;
const KEY_RUN_LOGS = (id: string) => `run:${id}:logs`;
const KEY_RUN_INDEX = "runs:index"; // sorted set score=timestamp, member=run id
const KEY_QUEUE = "runs:queue"; // list of run ids

export async function saveRun(run: Run) {
  await kv.set(KEY_RUN(run.id), run);
  const ts = Date.parse(run.updatedAt) || Date.now();
  await kv.zadd(KEY_RUN_INDEX, { score: ts, member: run.id });
}

export async function getRun(id: string): Promise<Run | null> {
  const v = await kv.get(KEY_RUN(id));
  return (v as Run) ?? null;
}

export async function listRuns(limit = 25): Promise<Run[]> {
  const ids = (await kv.zrange(KEY_RUN_INDEX, -limit, -1)) as string[];
  const runs = await Promise.all(ids.map((id) => getRun(id)));
  return runs.filter(Boolean) as Run[];
}

export async function enqueueRun(id: string) {
  await kv.lpush(KEY_QUEUE, id);
}

export async function dequeueRun(): Promise<string | null> {
  const v = await kv.rpop(KEY_QUEUE);
  return (v as string) ?? null;
}

export async function appendRunLog(id: string, line: string) {
  const entry = `${nowIso()} ${line}`;
  await kv.rpush(KEY_RUN_LOGS(id), entry);
}

export async function getRunLogs(id: string, limit = 300): Promise<string[]> {
  const logs = (await kv.lrange(KEY_RUN_LOGS(id), -limit, -1)) as string[];
  return logs ?? [];
}

export async function updateRunStatus(id: string, status: RunStatus, patch?: Partial<Run>) {
  const run = await getRun(id);
  if (!run) return null;

  const updated: Run = {
    ...run,
    ...patch,
    status,
    updatedAt: nowIso()
  };

  await saveRun(updated);
  return updated;
}

