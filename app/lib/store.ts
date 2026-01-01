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

/**
 * Create a project (demo in-memory).
 * Matches what debug routes expect.
 */
export async function createProject(
  userId: string,
  name: string
): Promise<{ id: string; name: string; createdAt: string }> {
  const project = {
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
 * Compatibility helpers.
 * Supports both:
 *   getProject(projectId)
 *   getProject(userId, projectId)
 */
export async function getProject(arg1: string, arg2?: string) {
  if (arg2) {
    const userId = arg1;
    const projectId = arg2;
    return await storeGet(`projects:${userId}:${projectId}`);
  }

  const projectId = arg1;

  // Try to find any matching project across stored keys (best-effort for demo build)
  for (const k of mem.keys()) {
    if (k.startsWith("projects:") && k.endsWith(`:${projectId}`)) {
      return await storeGet(k);
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
