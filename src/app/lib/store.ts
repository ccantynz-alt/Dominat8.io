import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

const PROJECT_INDEX_KEY = "projects:index";

export async function listProjects(): Promise<Project[]> {
  const ids = (await kv.lrange(PROJECT_INDEX_KEY, 0, -1)) as string[];
  if (!ids || ids.length === 0) return [];

  const projects = await Promise.all(
    ids.map(async (id) => {
      const p = await kv.get<Project>(`project:${id}`);
      return p ?? null;
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

  await kv.set(`project:${id}`, project);
  await kv.lpush(PROJECT_INDEX_KEY, id);

  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  return (await kv.get<Project>(`project:${id}`)) ?? null;
}
