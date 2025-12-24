// app/lib/kv.ts
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

function getRedisUrl() {
  // Vercel Redis integration provides KV_REDIS_URL (TCP)
  const url = (process.env.KV_REDIS_URL ?? "").trim();
  if (!url) {
    throw new Error(
      "KV not configured. Missing KV_REDIS_URL. (Vercel Storage should inject this when Redis is connected.)"
    );
  }
  return url;
}

async function getClient() {
  if (client) return client;

  const url = getRedisUrl();

  client = createClient({
    url,
    // Helpful for serverless stability
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
      // If something stored plain strings, return as-is
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
