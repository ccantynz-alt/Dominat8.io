// app/lib/kv.ts
import { Redis } from "@upstash/redis";

function normalizeUrl(u: string | undefined) {
  const s = (u ?? "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // If someone accidentally pasted only a domain, fix it.
  return `https://${s}`;
}

const url =
  normalizeUrl(process.env.UPSTASH_REDIS_REST_URL) ||
  normalizeUrl(process.env.KV_REST_API_URL);

const token =
  (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim() ||
  (process.env.KV_REST_API_TOKEN ?? "").trim();

if (!url || !token) {
  // Don't throw here; API routes can return a helpful error instead.
  // But we *do* want a clear console message.
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
    // Upstash uses list commands; lpush is supported
    await redis.lpush(key, value);
  },

  async lrange<T = unknown>(key: string, start: number, stop: number) {
    if (!redis) throw new Error("KV not configured (missing URL/token)");
    return (await redis.lrange<T>(key, start, stop)) ?? [];
  },
};
