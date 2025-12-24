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

function assertUrlLooksLikeKv(url: string) {
  // This is the exact mistake you hit: KV url accidentally set to your Vercel domain.
  if (url.includes("vercel.app")) {
    throw new Error(
      `KV URL is set to a Vercel domain (${url}). It must be an Upstash REST URL like https://xxxx.upstash.io. Fix your Vercel env var UPSTASH_REDIS_REST_URL or KV_REST_API_URL.`
    );
  }
}

const redis = (() => {
  if (!url || !token) return null;
  assertUrlLooksLikeKv(url);
  return new Redis({ url, token });
})();

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
