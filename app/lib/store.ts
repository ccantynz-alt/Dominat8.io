import { kv } from "./kv";
import { nowIso } from "./time";

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type RunKind =
  | "agent:plan"
  | "agent:build"
  | "agent:import"
  | "agent:deploy"
  | "agent:maintenance";

export type Run = {
  id: string;
  kind: RunKind;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  title: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
};

const KEY_RUN = (id: string) => `run:${id}`;
const KEY_RUN_LOGS = (id: string) => `run:${id}:logs`;
const KEY_RUN_INDEX = "runs:index";
const KEY_QUEUE = "runs:queue";

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
  const ids = (await kv.zrange(KEY_RUN_INDEX, -limit, -1)) as any[];
  const stringIds = (ids ?? []).map((x) => String(x));
  const runs = await Promise.all(stringIds.map((id) => getRun(id)));
  return runs.filter(Boolean) as Run[];
}

export async function enqueueRun(id: string) {
  await kv.lpush(KEY_QUEUE, id);
}

export async function dequeueRun(): Promise<string | null> {
  const v = await kv.rpop(KEY_QUEUE);
  return v ? String(v) : null;
}

export async function appendRunLog(id: string, line: string) {
  const entry = `${nowIso()} ${line}`;
  await kv.rpush(KEY_RUN_LOGS(id), entry);
}

export async function getRunLogs(id: string, limit = 300): Promise<string[]> {
  const logs = (await kv.lrange(KEY_RUN_LOGS(id), -limit, -1)) as any[];
  return (logs ?? []).map((x) => String(x));
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
