// app/lib/kv.ts
// Minimal in-memory KV layer to keep builds stable on Vercel.
// Supports get/set + sorted-set (zadd/zrange) + list queue/logs (lpush/rpush/rpop/lrange).

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

function getList(key: string) {
  const list = lists.get(key) ?? [];
  lists.set(key, list);
  return list;
}

export const kv = {
  async get(key: string) {
    return memory.get(key) ?? null;
  },

  async set(key: string, value: any) {
    memory.set(key, value);
  },

  // Sorted set: kv.zadd("myzset", { score: 123, member: "abc" })
  async zadd(key: string, entry: { score: number; member: string }) {
    const m = zsets.get(key) ?? new Map<string, number>();
    m.set(String(entry.member), Number(entry.score));
    zsets.set(key, m);
    return 1;
  },

  // Sorted set: returns members (like Redis ZRANGE)
  async zrange(key: string, start: number, stop: number, opts?: { rev?: boolean }) {
    const m = zsets.get(key);
    if (!m) return [];

    const arr = Array.from(m.entries()).map(([member, score]) => ({ member, score }));
    arr.sort((a, b) => (opts?.rev ? b.score - a.score : a.score - b.score));

    const end = stop >= 0 ? stop + 1 : undefined;
    return arr.slice(start, end).map((x) => x.member);
  },

  // List: LPUSH
  async lpush(key: string, value: string) {
    const list = getList(key);
    list.unshift(String(value));
    return list.length;
  },

  // List: RPUSH
  async rpush(key: string, value: string) {
    const list = getList(key);
    list.push(String(value));
    return list.length;
  },

  // List: RPOP
  async rpop(key: string) {
    const list = lists.get(key);
    if (!list || list.length === 0) return null;
    return list.pop() ?? null;
  },

  // List: LRANGE (inclusive stop, like Redis)
  async lrange(key: string, start: number, stop: number) {
    const list = lists.get(key) ?? [];
    const end = stop >= 0 ? stop + 1 : undefined;
    return list.slice(start, end);
  },
};
