const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

if (!KV_URL || !KV_TOKEN) {
  throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
}

async function kvFetch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${KV_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`KV error ${res.status}: ${text}`);
  }

  return res.json();
}

export const kv = {
  get: async <T = any>(key: string): Promise<T | null> => {
    const r: any = await kvFetch("/get", { key });
    return (r?.result ?? null) as T | null;
  },

  set: async (key: string, value: any) => {
    return kvFetch("/set", { key, value });
  },

  del: async (key: string) => {
    return kvFetch("/del", { key });
  },

  // ✅ accept any JSON value, not only string
  lpush: async (key: string, value: any) => {
    return kvFetch("/lpush", { key, value });
  },

  rpop: async (key: string): Promise<any | null> => {
    const r: any = await kvFetch("/rpop", { key });
    return r?.result ?? null;
  },

  // ✅ accept any JSON value, not only string
  rpush: async (key: string, value: any) => {
    return kvFetch("/rpush", { key, value });
  },

  lrange: async <T = any>(key: string, start: number, stop: number): Promise<T[]> => {
    const r: any = await kvFetch("/lrange", { key, start, stop });
    return (r?.result ?? []) as T[];
  },

  zadd: async (key: string, entry: { score: number; member: string }) => {
    return kvFetch("/zadd", { key, ...entry });
  },

  zrange: async <T = any>(key: string, start: number, stop: number): Promise<T[]> => {
    const r: any = await kvFetch("/zrange", { key, start, stop });
    return (r?.result ?? []) as T[];
  }
};

// Backwards-compatible alias
export const KV = kv;
