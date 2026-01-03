import { kv } from "@vercel/kv";

export type RunStatus = "queued" | "running" | "complete" | "failed";

export type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: RunStatus;
  createdAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
};

const runIndexKey = (projectId: string) => `runs:index:${projectId}`;
const runKey = (runId: string) => `run:${runId}`;

function hasKV() {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

function toRun(raw: unknown): Run | null {
  if (!raw) return null;

  if (typeof raw === "object") {
    const r = raw as any;
    if (r?.id && r?.projectId) return r as Run;
    return null;
  }

  if (typeof raw === "string") {
    try {
      const r = JSON.parse(raw);
      if (r?.id && r?.projectId) return r as Run;
      return null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function createRun(projectId: string, prompt: string): Promise<Run | null> {
  if (!hasKV()) return null;

  const id = "run_" + Date.now().toString(16) + Math.random().toString(16).slice(2);

  const run: Run = {
    id,
    projectId,
    prompt,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  await kv.set(runKey(id), run);
  await kv.sadd(runIndexKey(projectId), id);

  return run;
}

export async function listRuns(projectId: string): Promise<Run[] | null> {
  if (!hasKV()) return null;

  const ids = (await kv.smembers<string[]>(runIndexKey(projectId))) || [];
  if (!ids.length) return [];

  const keys = ids.map((id) => runKey(id));
  const values = await kv.mget<any[]>(...keys);

  const runs: Run[] = [];
  for (const v of values) {
    const r = toRun(v);
    if (r) runs.push(r);
  }

  runs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return runs;
}

export async function getRun(projectId: string, runId: string): Promise<Run | null> {
  if (!hasKV()) return null;

  const raw = await kv.get(runKey(runId));
  const run = toRun(raw);

  if (!run) return null;
  if (run.projectId !== projectId) return null;

  return run;
}

export async function saveRun(run: Run): Promise<Run | null> {
  if (!hasKV()) return null;

  await kv.set(runKey(run.id), run);
  await kv.sadd(runIndexKey(run.projectId), run.id);

  return run;
}
