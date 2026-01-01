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

/**
 * Compatibility helpers for older imports in dashboard pages.
 * These are simple placeholders so the app compiles.
 */
export async function getProject(userId: string, projectId: string) {
  return await storeGet(`projects:${userId}:${projectId}`);
}

export async function listRuns(userId: string, projectId: string) {
  const ids = (await storeGet<string[]>(`runs:index:${userId}:${projectId}`)) ?? [];
  const runs = [];
  for (const id of ids) {
    const run = await storeGet(`runs:${userId}:${id}`);
    if (run) runs.push(run);
  }
  return runs;
}
