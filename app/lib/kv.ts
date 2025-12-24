// app/lib/kv.ts
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

function pickFirst(...vals: Array<string | undefined>) {
  for (const v of vals) {
    const s = (v ?? "").trim();
    if (s) return s;
  }
  return "";
}

function getRedisUrl() {
  // Vercel Redis integration can inject different names depending on how it's connected / prefix.
  // We support all common variants:
  const url = pickFirst(
    process.env.KV_REDIS_URL,
    (process.env as any).kv_REDIS_URL, // in case prefix was lowercase
    process.env.KV_URL,
    (process.env as any).kv_URL,
    process.env.REDIS_URL
  );

  if (!url) {
    throw new Error(
      "KV not configured. Missing one of: KV_REDIS_URL, kv_REDIS_URL, KV_URL, kv_URL, REDIS_URL. Check Vercel Storage → Redis connection and environment scopes."
    );
  }

  return url;
}

async function getClient() {
  if (client) return client;

  const url = getRedisUrl();

  client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

export const KV = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const c = await getClient();
    const raw = await c.get(key);
    if (raw == null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  async set(key: string, value: unknown) {
    const c = await getClient();
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    await c.set(key, raw);
  },

  async lpush(key: string, value: unknown) {
    const c = await getClient();
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    await c.lPush(key, raw);
  },

  async rpush(key: string, value: unknown) {
    const c = await getClient();
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    await c.rPush(key, raw);
  },

  async lrange<T = unknown>(key: string, start: number, stop: number) {
    const c = await getClient();
    const items = await c.lRange(key, start, stop);
    return items.map((raw) => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    });
  },
};
