// ProjectsRoute.ts
import "server-only";
import { kv, kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

export type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

export async function getProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // ✅ SET index (REST compatible)
  const idsRaw = await kv.smembers(indexKey(userId)).catch(() => []);
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
