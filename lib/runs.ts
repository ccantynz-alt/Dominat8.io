// lib/runs.ts
import { kv } from "@/app/lib/kv";
import { randomUUID } from "crypto";

export type RunStatus = "queued" | "running" | "done" | "failed";

export type Run = {
  id: string;
  projectId?: string;
  threadId?: string;
  prompt: string;

  status: RunStatus;

  createdAt: string;
  updatedAt: string;

  startedAt?: string;
  finishedAt?: string;

  error?: string;
};

function nowISO() {
  return new Date().toISOString();
}

function runKey(runId: string) {
  return `run:${runId}`;
}

function runLogsKey(runId: string) {
  return `run:logs:${runId}`;
}

function projectRunsIndexKey(projectId: string) {
  return `runs:index:project:${projectId}`;
}

function threadRunsIndexKey(threadId: string) {
  return `runs:index:thread:${threadId}`;
}

const QUEUE_KEY = "runs:queue";

export function newRunId() {
  return `run_${randomUUID().replace(/-/g, "")}`;
}

export async function createRun(input: {
  prompt: string;
  projectId?: string;
  threadId?: string;
}) {
  const id = newRunId();
  const ts = nowISO();

  const run: Run = {
    id,
    prompt: input.prompt,
    projectId: input.projectId,
    threadId: input.threadId,
    status: "queued",
    createdAt: ts,
    updatedAt: ts,
  };

  await kv.set(runKey(id), run);
  await kv.del(runLogsKey(id));

  if (input.projectId) await kv.lpush(projectRunsIndexKey(input.projectId), id);
  if (input.threadId) await kv.lpush(threadRunsIndexKey(input.threadId), id);

  await kv.rpush(QUEUE_KEY, id);

  return run;
}

export async function getRun(runId: string) {
  return (await kv.get(runKey(runId))) as Run | null;
}

export async function setRun(runId: string, patch: Partial<Run>) {
  const existing = await getRun(runId);
  if (!existing) return null;
  const updated: Run = { ...existing, ...patch, updatedAt: nowISO() };
  await kv.set(runKey(runId), updated);
  return updated;
}

export async function appendRunLog(runId: string, line: string) {
  const ts = nowISO();
  await kv.rpush(runLogsKey(runId), `[${ts}] ${line}`);
}

export async function getRunLogs(runId: string, limit = 200) {
  const len = (await kv.llen(runLogsKey(runId))) as number;
  const start = Math.max(0, len - limit);
  return ((await kv.lrange(runLogsKey(runId), start, -1)) as string[]) ?? [];
}

export async function listRunsForProject(projectId: string, limit = 50) {
  return (
    ((await kv.lrange(projectRunsIndexKey(projectId), 0, limit - 1)) as string[]) ?? []
  ).filter(Boolean);
}

export async function listRunsForThread(threadId: string, limit = 50) {
  return (
    ((await kv.lrange(threadRunsIndexKey(threadId), 0, limit - 1)) as string[]) ?? []
  ).filter(Boolean);
}

export async function dequeueRunId() {
  return (await kv.lpop(QUEUE_KEY)) as string | null;
}

export async function claimRunLock(runId: string, ttlSeconds = 60) {
  const lockKey = `run:lock:${runId}`;
  const ok = await kv.set(lockKey, "1", { nx: true, ex: ttlSeconds });
  return !!ok;
}
