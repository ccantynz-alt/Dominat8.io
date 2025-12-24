// app/lib/kv.ts
import { Redis } from "@upstash/redis";

function normalizeUrl(u: string | undefined) {
  const s = (u ?? "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

const url =
  normalizeUrl(process.env.UPSTASH_REDIS_REST_URL) ||
  normalizeUrl(process.env.KV_REST_API_URL);

const token =
  (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim() ||
  (process.env.KV_REST_API_TOKEN ?? "").trim();

if (!url || !token) {
  console.warn(
    "KV is not configured. Missing UPSTASH_REDIS_REST_URL/KV_REST_API_URL or token."
  );
}

const redis = url && token ? new Redis({ url, token }) : null;

export const KV = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    return (await redis.get<T>(key)) ?? null;
  },

  async set(key: string, value: unknown) {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    await redis.set(key, value);
  },

  async lpush(key: string, value: unknown) {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    await redis.lpush(key, value);
  },

  async rpush(key: string, value: unknown) {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    await redis.rpush(key, value);
  },

  async lrange<T = unknown>(key: string, start: number, stop: number) {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    return (await redis.lrange<T>(key, start, stop)) ?? [];
  },
};
