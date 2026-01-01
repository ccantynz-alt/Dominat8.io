import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

/* =========================
   Types
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
   Keys
========================= */

const PROJECT_INDEX_KEY = "projects:index";

function projectKey(id: string) {
  return `project:${id}`;
}

function runIndexKey(projectId: string) {
  return `runs:index:${projectId}`;
}

function runKey(runId: string) {
  return `run:${runId}`;
}

/* =========================
   Projects
========================= */

export async function listProjects(): Promise<Project[]> {
  const ids = (await kv.smembers(PROJECT_INDEX_KEY)) as string[];
  if (!ids || ids.length === 0) return [];

  const projects = await Promise.all(
    ids.map(async (id) => {
      const raw = await kv.get(projectKey(id));
      if (!raw) return null;
      return JSON.parse(raw as string) as Project;
    })
  );

  return projects.filter(Boolean) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const raw = await kv.get(projectKey(id));
  if (!raw) return null;
  return JSON.parse(raw as string) as Project;
}

export async function createProject(name: string): Promise<Project> {
  const id = randomUUID();

  const project: Project = {
    id,
    name,
    createdAt: new Date().toISOString(),
  };

  await kv.set(projectKey(id), JSON.stringify(project));
  await kv.sadd(PROJECT_INDEX_KEY, id);

  return project;
}

/* =========================
   Runs
========================= */

export async function listRuns(projectId: string): Promise<Run[]> {
  const ids = (await kv.smembers(runIndexKey(projectId))) as string[];
  if (!ids || ids.length === 0) return [];

  const runs = await Promise.all(
    ids.map(async (id) => {
      const raw = await kv.get(runKey(id));
      if (!raw) return null;
      return JSON.parse(raw as string) as Run;
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

  await kv.set(runKey(id), JSON.stringify(run));
  await kv.sadd(runIndexKey(projectId), id);

  return run;
}
