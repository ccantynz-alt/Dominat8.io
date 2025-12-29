// app/lib/store.ts
import "server-only";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";

// -----------------------------
// Types
// -----------------------------
export type Project = {
  id: string;
  name: string;
  createdAt?: string;
  files?: Array<{ path: string; content: string }>;
};

export type Run = {
  id: string;
  projectId: string;
  status: string;
  createdAt?: string;
  prompt?: string;
  files?: Array<{ path: string; content: string }>;
};

// -----------------------------
// Keys
// -----------------------------
function projectsIndexKey(userId: string) {
  return `projects:index:${userId}`; // SET of project IDs
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runsIndexKey(userId: string, projectId: string) {
  return `runs:index:${userId}:${projectId}`; // SET of run IDs
}

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

// -----------------------------
// Projects (EXPORTED)
// -----------------------------
export async function createProject(userId: string, name: string): Promise<Project> {
  const projectId = `proj_${cryptoRandomId()}`;
  const project: Project = {
    id: projectId,
    name,
    createdAt: kvNowISO(),
    files: [],
  };

  await kvJsonSet(projectKey(userId, projectId), project);
  await kv.sadd(projectsIndexKey(userId), projectId);

  return project;
}

export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  return kvJsonGet<Project>(projectKey(userId, projectId));
}

export async function listProjects(userId: string): Promise<Project[]> {
  const idsRaw = await kv.smembers(projectsIndexKey(userId)).catch(() => []);
  const ids: string[] = Array.isArray(idsRaw) ? idsRaw.map(String).filter(Boolean) : [];

  if (ids.length === 0) return [];

  const projects: Project[] = [];
  for (const id of ids) {
    const p = await kvJsonGet<Project>(projectKey(userId, id));
    if (p && p.id && p.name) projects.push(p);
  }

  projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return projects;
}

// -----------------------------
// Runs (EXPORTED)
// -----------------------------
export async function createRun(
  userId: string,
  projectId: string,
  input: { prompt?: string; status?: string } = {}
): Promise<Run> {
  const runId = `run_${cryptoRandomId()}`;

  const run: Run = {
    id: runId,
    projectId,
    status: input.status || "queued",
    prompt: input.prompt,
    createdAt: kvNowISO(),
    files: [],
  };

  await kvJsonSet(runKey(userId, runId), run);
  await kv.sadd(runsIndexKey(userId, projectId), runId);

  return run;
}

export async function getRun(userId: string, runId: string): Promise<Run | null> {
  return kvJsonGet<Run>(runKey(userId, runId));
}

export async function listRuns(userId: string, projectId: string): Promise<Run[]> {
  const idsRaw = await kv.smembers(runsIndexKey(userId, projectId)).catch(() => []);
  const ids: string[] = Array.isArray(idsRaw) ? idsRaw.map(String).filter(Boolean) : [];

  if (ids.length === 0) return [];

  const runs: Run[] = [];
  for (const id of ids) {
    const r = await kvJsonGet<Run>(runKey(userId, id));
    if (r && r.id) runs.push(r);
  }

  runs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return runs;
}

// -----------------------------
// Helpers
// -----------------------------
function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID().replace(/-/g, "");
  }
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
}
