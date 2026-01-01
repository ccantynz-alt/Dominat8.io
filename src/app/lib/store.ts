import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: "queued" | "running" | "complete" | "failed";
  createdAt: string;
};

const PROJECT_INDEX_KEY = "projects:index"; // set of project ids
const RUNS_INDEX_KEY = (projectId: string) => `runs:index:${projectId}`; // set of run ids
const PROJECT_KEY = (id: string) => `project:${id}`; // json string
const RUN_KEY = (id: string) => `run:${id}`; // json string

function nowISO() {
  return new Date().toISOString();
}

async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = (await kv.get(key)) as unknown;

  if (raw == null) return null;

  // If stored as a JSON string
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  // If kv returns an already-parsed object
  if (typeof raw === "object") {
    return raw as T;
  }

  return null;
}

async function kvSetJson(key: string, value: unknown) {
  await kv.set(key, JSON.stringify(value));
}

export async function listProjects(): Promise<Project[]> {
  const ids = (await kv.smembers(PROJECT_INDEX_KEY)) as unknown as string[];
  if (!ids || ids.length === 0) return [];
  const projects = await Promise.all(ids.map((id) => kvGetJson<Project>(PROJECT_KEY(id))));
  return projects.filter(Boolean) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  return kvGetJson<Project>(PROJECT_KEY(id));
}

export async function createProject(name: string): Promise<Project> {
  const id = `proj_${randomUUID().replace(/-/g, "")}`;
  const project: Project = { id, name, createdAt: nowISO() };
  await kvSetJson(PROJECT_KEY(id), project);
  await kv.sadd(PROJECT_INDEX_KEY, id);
  return project;
}

export async function listRuns(projectId: string): Promise<Run[]> {
  const ids = (await kv.smembers(RUNS_INDEX_KEY(projectId))) as unknown as string[];
  if (!ids || ids.length === 0) return [];
  const runs = await Promise.all(ids.map((id) => kvGetJson<Run>(RUN_KEY(id))));
  return runs.filter(Boolean) as Run[];
}

export async function createRun(projectId: string, prompt: string): Promise<Run> {
  const id = `run_${randomUUID().replace(/-/g, "")}`;
  const run: Run = { id, projectId, prompt, status: "queued", createdAt: nowISO() };
  await kvSetJson(RUN_KEY(id), run);
  await kv.sadd(RUNS_INDEX_KEY(projectId), id);
  return run;
}

/**
 * ---------------------------------------------------------------------
 * Legacy compatibility layer
 * Some older API routes still import storeGet/storeSet.
 * Keep these so the build compiles while we migrate routes gradually.
 * ---------------------------------------------------------------------
 */

export async function storeGet<T = unknown>(key: string): Promise<T | null> {
  return kvGetJson<T>(key);
}

export async function storeSet(key: string, value: unknown): Promise<void> {
  await kvSetJson(key, value);
}
