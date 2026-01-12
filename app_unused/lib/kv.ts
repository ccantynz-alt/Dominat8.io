type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const memKV = new Map<string, Json>();
const memSets = new Map<string, Set<string>>();

export function kvNowISO() {
  return new Date().toISOString();
}

/**
 * Minimal placeholder KV client + helpers so the build compiles.
 * This includes methods your existing code expects (smembers, sadd, srem, etc).
 * Replace with real Upstash/Vercel KV later.
 */
export const kv = {
  async get<T>(key: string): Promise<T | null> {
    return (memKV.get(key) as T) ?? null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    memKV.set(key, value as unknown as Json);
  },

  async del(key: string): Promise<void> {
    memKV.delete(key);
    memSets.delete(key);
  },

  async smembers(key: string): Promise<string[]> {
    const set = memSets.get(key);
    return set ? Array.from(set) : [];
  },

  async sadd(key: string, ...values: string[]): Promise<number> {
    let set = memSets.get(key);
    if (!set) {
      set = new Set<string>();
      memSets.set(key, set);
    }
    const before = set.size;
    for (const v of values) set.add(String(v));
    return set.size - before;
  },

  async srem(key: string, ...values: string[]): Promise<number> {
    const set = memSets.get(key);
    if (!set) return 0;
    let removed = 0;
    for (const v of values) {
      if (set.delete(String(v))) removed++;
    }
    return removed;
  }
};

export async function kvJsonGet<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key);
}

export async function kvJsonSet<T>(key: string, value: T): Promise<void> {
  await kv.set<T>(key, value);
}
