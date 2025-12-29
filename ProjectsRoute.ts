// ProjectsRoute.ts
import "server-only";

import { z } from "zod";
import { randomUUID } from "crypto";

import { getCurrentUserId } from "./app/lib/demoAuth";
import { kvJsonGet, kvJsonSet, kvNowISO, kv } from "./app/lib/kv";

export type Project = {
  id: string;
  projectId: string; // MUST always exist and equal id
  name: string;
  createdAt: string;
};

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizeProject(raw: any): Project {
  const id = String(raw?.projectId || raw?.id || "");
  return {
    id,
    projectId: id,
    name: String(raw?.name || "Untitled Project"),
    createdAt: String(raw?.createdAt || kvNowISO()),
  };
}

export async function listProjectsForCurrentUser(): Promise<Project[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const ids = (await kv.zrange(indexKey(userId), 0, -1)) as unknown as string[];
  if (!ids || ids.length === 0) return [];

  const projects = await Promise.all(
    ids.map(async (projectId) => {
      const raw = await kvJsonGet(projectKey(userId, projectId));
      if (!raw) return null;
      return normalizeProject(raw);
    })
  );

  return (projects.filter(Boolean) as Project[]).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

export async function createProjectForCurrentUser(input?: unknown): Promise<Project> {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const parsed = CreateProjectSchema.safeParse(input ?? {});
  if (!parsed.success) {
    throw new Error("Invalid project input");
  }

  const projectId = uid("proj");
  const createdAt = kvNowISO();
  const name = parsed.data.name?.trim() || "Untitled Project";

  const project: Project = {
    id: projectId,
    projectId,
    name,
    createdAt,
  };

  await kvJsonSet(projectKey(userId, projectId), project);
  await kv.zadd(indexKey(userId), { score: Date.now(), member: projectId });

  return project;
}

export async function ensureProjectForCurrentUser(): Promise<Project> {
  const projects = await listProjectsForCurrentUser();
  if (projects.length > 0) return projects[0];
  return await createProjectForCurrentUser({ name: "Untitled Project" });
}
