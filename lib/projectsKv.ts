import { kv } from "@vercel/kv";

export type ProjectRow = {
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  publishedUrl?: string;
};

function keyProject(projectId: string) {
  return `project:${projectId}`;
}

// We keep a simple array of project IDs in KV.
// This avoids zset methods like zrevrange which your KV typings don't support.
const KEY_INDEX_LIST = "projects:index:list";

async function readIndex(): Promise<string[]> {
  const ids = (await kv.get<string[]>(KEY_INDEX_LIST)) || [];
  return Array.isArray(ids) ? ids : [];
}

async function writeIndex(ids: string[]) {
  // Keep it bounded so it doesn't grow forever during testing
  const bounded = ids.slice(0, 200);
  await kv.set(KEY_INDEX_LIST, bounded);
}

export async function createProjectKv(projectId: string, name: string) {
  const now = Date.now();
  const row: ProjectRow = {
    projectId,
    name: name || "Untitled site",
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(keyProject(projectId), row);

  // Prepend newest projectId to the front of the list
  const ids = await readIndex();
  const next = [projectId, ...ids.filter((x) => x !== projectId)];
  await writeIndex(next);

  return row;
}

export async function setProjectNameKv(projectId: string, name: string) {
  const existing = (await kv.get<ProjectRow>(keyProject(projectId))) || null;
  const now = Date.now();

  const row: ProjectRow = {
    projectId,
    name: name || existing?.name || "Untitled site",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedUrl: existing?.publishedUrl,
  };

  await kv.set(keyProject(projectId), row);

  // Ensure it exists in index (and bubbles to front)
  const ids = await readIndex();
  const next = [projectId, ...ids.filter((x) => x !== projectId)];
  await writeIndex(next);

  return row;
}

export async function setProjectPublishedKv(projectId: string, publishedUrl: string) {
  const existing = (await kv.get<ProjectRow>(keyProject(projectId))) || null;
  const now = Date.now();

  const row: ProjectRow = {
    projectId,
    name: existing?.name || "Untitled site",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedUrl,
  };

  await kv.set(keyProject(projectId), row);

  // Ensure it exists in index (and bubbles to front)
  const ids = await readIndex();
  const next = [projectId, ...ids.filter((x) => x !== projectId)];
  await writeIndex(next);

  return row;
}

export async function listProjectsKv(limit = 50): Promise<ProjectRow[]> {
  const ids = await readIndex();
  const slice = ids.slice(0, Math.max(0, limit));

  if (!slice.length) return [];

  const rows = await Promise.all(slice.map((id) => kv.get<ProjectRow>(keyProject(id))));
  return rows.filter(Boolean) as ProjectRow[];
}

export async function getProjectKv(projectId: string): Promise<ProjectRow | null> {
  return (await kv.get<ProjectRow>(keyProject(projectId))) || null;
}
