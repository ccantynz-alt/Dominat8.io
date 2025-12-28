// app/lib/kv.ts
// Minimal in-memory KV layer to keep builds stable on Vercel.
// Supports get/set + tiny sorted-set (zadd/zrange) + list queue (lpush/rpop).

const memory = new Map<string, any>();

// sorted set store: key -> Map(member -> score)
const zsets = new Map<string, Map<string, number>>();

// list store: key -> array
const lists = new Map<string, string[]>();

export function kvNowISO() {
  return new Date().toISOString();
}

export async function kvJsonGet<T = any>(key: string): Promise<T | null> {
  return (memory.get(key) as T) ?? null;
}

export async function kvJsonSet(key: string, value: any) {
  memory.set(key, value);
}

export const kv = {
  async get(key: string) {
    return memory.get(key) ?? null;
  },

  async set(key: string, value: any) {
    memory.set(key, value);
  },

  // Minimal zadd implementation:
  // kv.zadd("myzset", { score: 123, member: "abc" })
  async zadd(key: string, entry: { score: number; member: string }) {
    const m = zsets.get(key) ?? new Map<string, number>();
    m.set(String(entry.member), Number(entry.score));
    zsets.set(key, m);
    return 1;
  },

  // Minimal zrange implementation (returns members)
  async zrange(key: string, start: number, stop: number, opts?: { rev?: boolean }) {
    const m = zsets.get(key);
    if (!m) return [];

    const arr = Array.from(m.entries()).map(([member, score]) => ({ member, score }));
    arr.sort((a, b) => (opts?.rev ? b.score - a.score : a.score - b.score));

    const end = stop >= 0 ? stop + 1 : undefined;
    return arr.slice(start, end).map((x) => x.member);
  },

  // List/queue helpers (Redis-like)
  async lpush(key: string, value: string) {
    const list = lists.get(key) ?? [];
    list.unshift(String(value));
    lists.set(key, list);
    return list.length;
  },

  async rpop(key: string) {
    const list = lists.get(key);
    if (!list || list.length === 0) return null;
    const v = list.pop() ?? null;
    lists.set(key, list);
    return v;
  },
};
