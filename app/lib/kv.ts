// app/lib/kv.ts
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

function pickRedisUrl() {
  // Vercel sometimes injects KV_REDIS_URL, sometimes REDIS_URL.
  const kvRedisUrl = (process.env.KV_REDIS_URL ?? "").trim();
  const redisUrl = (process.env.REDIS_URL ?? "").trim();

  if (kvRedisUrl) return { url: kvRedisUrl, source: "KV_REDIS_URL" };
  if (redisUrl) return { url: redisUrl, source: "REDIS_URL" };

  throw new Error(
    "KV not configured. Missing KV_REDIS_URL or REDIS_URL. (Vercel Storage should inject one of these when Redis/KV is connected to the project + environment.)"
  );
}

async function getClient() {
  if (client) return client;

  const { url, source } = pickRedisUrl();

  client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  client.on("error", (err) => {
    console.error(`Redis client error (${source}):`, err);
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
