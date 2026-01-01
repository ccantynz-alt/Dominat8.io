type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const mem = new Map<string, Json>();

export async function storeGet<T = Json>(key: string): Promise<T | null> {
  return (mem.get(key) as T) ?? null;
}

export async function storeSet<T = Json>(key: string, value: T): Promise<void> {
  mem.set(key, value as unknown as Json);
}

export async function storeDel(key: string): Promise<void> {
  mem.delete(key);
}

export async function storeKeys(prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for (const k of mem.keys()) {
    if (!prefix || k.startsWith(prefix)) out.push(k);
  }
  return out;
}

function uid(prefix = ""): string {
  const id = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}

type Project = { id: string; name: string; createdAt: string };

/**
 * Create a project (demo in-memory).
 * Supports BOTH call styles:
 *   createProject(userId, name)
 *   createProject({ name, userId? })
 */
export async function createProject(
  arg1: string | { name: string; userId?: string },
  arg2?: string
): Promise<Project> {
  const userId = typeof arg1 === "string" ? arg1 : arg1.userId ?? "demo";
  const name =
    typeof arg1 === "string"
      ? (arg2 ?? "Untitled Project")
      : arg1.name ?? "Untitled Project";

  const project: Project = {
    id: uid("proj"),
    name: name || "Untitled Project",
    createdAt: new Date().toISOString()
  };

  const indexKey = `projects:index:${userId}`;
  const ids = (await storeGet<string[]>(indexKey)) ?? [];
  ids.unshift(project.id);

  await storeSet(indexKey, ids);
  await storeSet(`projects:${userId}:${project.id}`, project);

  return project;
}

/**
 * List projects.
 * Supports BOTH call styles:
 *   listProjects(userId)
 *   listProjects()
 */
export async function listProjects(userId?: string): Promise<Project[]> {
  const uidToUse = userId ?? "demo";
  const indexKey = `projects:index:${uidToUse}`;
  const ids = (await storeGet<string[]>(indexKey)) ?? [];

  const out: Project[] = [];
  for (const id of ids) {
    const p = await storeGet<Project>(`projects:${uidToUse}:${id}`);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Compatibility helpers.
 * Supports both:
 *   getProject(projectId)
 *   getProject(userId, projectId)
 */
export async function getProject(arg1: string, arg2?: string) {
  if (arg2) {
    const userId = arg1;
    const projectId = arg2;
    return await storeGet<Project>(`projects:${userId}:${projectId}`);
  }

  const projectId = arg1;

  // Try to find any matching project across stored keys (best-effort for demo build)
  for (const k of mem.keys()) {
    if (k.startsWith("projects:") && k.endsWith(`:${projectId}`)) {
      return await storeGet<Project>(k);
    }
  }

  return null;
}

/**
 * Supports both:
 *   listRuns(projectId)
 *   listRuns(userId, projectId)
 */
export async function listRuns(arg1: string, arg2?: string) {
  if (arg2) {
    const userId = arg1;
    const projectId = arg2;

    const ids = (await storeGet<string[]>(`runs:index:${userId}:${projectId}`)) ?? [];
    const runs: any[] = [];

    for (const id of ids) {
      const run = await storeGet<any>(`runs:${userId}:${id}`);
      if (run) runs.push(run);
    }

    return runs;
  }

  const _projectId = arg1;

  // Best-effort: return empty list for demo build when userId not provided
  return [];
}
