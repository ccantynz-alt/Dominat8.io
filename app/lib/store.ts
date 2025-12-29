// app/lib/store.ts
import { randomUUID } from "crypto";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "./kv";
import { getCurrentUserId } from "./demoAuth";

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type Run = {
  id: string;
  projectId: string;
  status: string;
  createdAt: string;
  prompt?: string;
};

function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function projectsIndexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runsIndexKey(userId: string, projectId: string) {
  return `runs:index:${userId}:${projectId}`;
}

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

// -------------------------
// Projects
// -------------------------

export async function createProject(input: { name: string }): Promise<Project> {
  const userId = await getCurrentUserId();
  const id = uid("proj");
  const createdAt = kvNowISO();

  const project: Project = { id, name: input.name, createdAt };

  // Write project record
  await kvJsonSet(projectKey(userId, id), project);

  // Add project ID to index set
  await kv.sadd(projectsIndexKey(userId), id);

  return project;
}

export async function listProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId();
  const ids = await kv.smembers(projectsIndexKey(userId));
  if (!ids || ids.length === 0) return [];

  const projects: Project[] = [];
  for (const id of ids) {
    const p = await kvJsonGet<Project>(projectKey(userId, id));
    if (p) projects.push(p);
  }

  projects.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return projects;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const userId = await getCurrentUserId();
  return await kvJsonGet<Project>(projectKey(userId, projectId));
}

// -------------------------
// Runs
// -------------------------

export async function createRun(input: {
  projectId: string;
  prompt: string;
  status?: string;
}): Promise<Run> {
  const userId = await getCurrentUserId();
  const id = uid("run");
  const createdAt = kvNowISO();

  const run: Run = {
    id,
    projectId: input.projectId,
    status: input.status ?? "queued",
    createdAt,
    prompt: input.prompt,
  };

  // Write run record
  await kvJsonSet(runKey(userId, id), run);

  // Add run ID to runs index set
  await kv.sadd(runsIndexKey(userId, input.projectId), id);

  return run;
}

export async function listRuns(projectId: string): Promise<Run[]> {
  const userId = await getCurrentUserId();
  const ids = await kv.smembers(runsIndexKey(userId, projectId));
  if (!ids || ids.length === 0) return [];

  const runs: Run[] = [];
  for (const id of ids) {
    const r = await kvJsonGet<Run>(runKey(userId, id));
    if (r) runs.push(r);
  }

  runs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return runs;
}
