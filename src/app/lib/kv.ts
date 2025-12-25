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
    const text = await res.text();
    throw new Error(`KV error ${res.status}: ${text}`);
  }

  return res.json();
}

export const kv = {
  get: <T>(key: string) =>
    kvFetch<T>("/get", { key }).then((r: any) => r.result ?? null),

  set: (key: string, value: any) =>
    kvFetch("/set", { key, value }),

  del: (key: string) =>
    kvFetch("/del", { key }),

  lpush: (key: string, value: string) =>
    kvFetch("/lpush", { key, value }),

  rpop: (key: string) =>
    kvFetch<string | null>("/rpop", { key }).then((r: any) => r.result ?? null),

  rpush: (key: string, value: string) =>
    kvFetch("/rpush", { key, value }),

  lrange: <T>(key: string, start: number, stop: number) =>
    kvFetch<T[]>("/lrange", { key, start, stop }).then((r: any) => r.result ?? []),

  zadd: (key: string, entry: { score: number; member: string }) =>
    kvFetch("/zadd", { key, ...entry }),

  zrange: <T>(key: string, start: number, stop: number) =>
    kvFetch<T[]>("/zrange", { key, start, stop }).then((r: any) => r.result ?? [])
};
