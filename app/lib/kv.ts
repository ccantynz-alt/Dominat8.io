type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const memKV = new Map<string, Json>();
const memSets = new Map<string, Set<string>>();

export function kvNowISO() {
  return new Date().toISOString();
}

/**
 * Minimal placeholder KV client + helpers so the build compiles.
 * This includes the methods your existing code expects (smembers, sadd, srem, etc).
 * Replace with real Upstash/Vercel KV later.
 */
export const kv = {
  async get<T>(_key: string): Promise<T | null> {
    return (memKV.get(_key) as T) ?? null;
  },

  async set<T>(_key: string, _value: T): Promise<void> {
    memKV.set(_key, _value as unknown as Json);
  },

  async del(_key: string): Promise<void> {
    memKV.delete(_key);
    memSets.delete(_key);
  },

  async smembers(_key: string): Promise<string[]> {
    const set = memSets.get(_key);
    return set ? Array.from(set) : [];
  },

  async sadd(_key: string, ...values: string[]): Promise<number> {
    let set = memSets.get(_key);
    if (!set) {
      set = new Set<string>();
      memSets.set(_key, set);
    }
    const before = set.size;
    for (const v of values) set.add(String(v));
    return set.size - before;
  },

  async srem(_key: string, ...values: string[]): Promise<number> {
    const set = memSets.get(_key);
    if (!set) return 0;
    let removed = 0;
    for (const v of values) {
      if (set.delete(String(v))) removed++;
    }
    return removed;
  }
};

export async function kvJsonGet<T>(_key: string): Promise<T | null> {
  return await kv.get<T>(_key);
}

export async function kvJsonSet<T>(_key: string, _value: T): Promise<void> {
  await kv.set<T>(_key, _value);
}
