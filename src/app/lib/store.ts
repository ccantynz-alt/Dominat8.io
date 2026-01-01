import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

/* =====================
   TYPES
===================== */

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

/* =====================
   KEYS
===================== */

const projectKey = (id: string) => `project:${id}`;
const projectIndexKey = "projects:index";
const runKey = (id: string) => `run:${id}`;
const runIndexKey = (projectId: string) => `runs:${projectId}`;

/* =====================
   PROJECTS
===================== */

export async function createProject(name: string): Promise<Project> {
  const id = randomUUID();

  const project: Project = {
    id,
    name,
    createdAt: new Date().toISOString(),
  };

  await kv.set(projectKey(id), JSON.stringify(project));
  await kv.sadd(projectIndexKey, id);

  return project;
}

export async function listProjects(): Promise<Project[]> {
  const ids = await kv.smembers(projectIndexKey);

  const projects = await Promise.all(
    ids.map(async (id) => {
      const raw = await kv.get(projectKey(id));
      return raw ? JSON.parse(raw as string) : null;
    })
  );

  return projects.filter(Boolean) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const raw = await kv.get(projectKey(id));
  return raw ? JSON.parse(raw as string) : null;
}

/* =====================
   RUNS
===================== */

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

export async function listRuns(projectId: string): Promise<Run[]> {
  const ids = await kv.smembers(runIndexKey(projectId));

  const runs = await Promise.all(
    ids.map(async (id) => {
      const raw = await kv.get(runKey(id));
      return raw ? JSON.parse(raw as string) : null;
    })
  );

  return runs.filter(Boolean) as Run[];
}
