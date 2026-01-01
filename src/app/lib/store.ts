import { kv } from "./kv";
import { randomUUID } from "crypto";

/* =========================
   TYPES
========================= */

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
};

/* =========================
   KEYS
========================= */

const PROJECT_INDEX_KEY = "projects:index";

function projectKey(id: string) {
  return `project:${id}`;
}

function runKey(id: string) {
  return `run:${id}`;
}

function runIndexKey(projectId: string) {
  return `runs:index:${projectId}`;
}

/* =========================
   PROJECTS
========================= */

export async function listProjects(): Promise<Project[]> {
  const ids = (await kv.smembers(PROJECT_INDEX_KEY)) as string[];
  if (!ids || ids.length === 0) return [];

  const projects = await Promise.all(
    ids.map(async (id) => {
      const p = (await kv.get(projectKey(id))) as unknown as Project | null;
      return p;
    })
  );

  return projects.filter(Boolean) as Project[];
}

export async function createProject(name: string): Promise<Project> {
  const id = randomUUID();

  const project: Project = {
    id,
    name,
    createdAt: new Date().toISOString(),
  };

  await kv.set(projectKey(id), project);
  await kv.sadd(PROJECT_INDEX_KEY, id);

  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  return (await kv.get(projectKey(id))) as Project | null;
}

/* =========================
   RUNS
========================= */

export async function listRuns(projectId: string): Promise<Run[]> {
  const ids = (await kv.smembers(runIndexKey(projectId))) as string[];
  if (!ids || ids.length === 0) return [];

  const runs = await Promise.all(
    ids.map(async (id) => {
      const r = (await kv.get(runKey(id))) as Run | null;
      return r;
    })
  );

  return runs.filter(Boolean) as Run[];
}

export async function createRun(
  projectId: string,
  prompt: string
): Promise<Run> {
  const id = randomUUID();

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
