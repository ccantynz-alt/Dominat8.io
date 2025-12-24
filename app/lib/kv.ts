// app/lib/kv.ts
import { Redis as UpstashRest } from "@upstash/redis";

function normalizeUrl(u: string | undefined) {
  const s = (u ?? "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

// Prefer REST vars (recommended)
const restUrl =
  normalizeUrl(process.env.UPSTASH_REDIS_REST_URL) ||
  normalizeUrl(process.env.KV_REST_API_URL);

const restToken =
  (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim() ||
  (process.env.KV_REST_API_TOKEN ?? "").trim();

// Some Vercel Redis integrations also provide only KV_REDIS_URL (TCP).
// That will NOT work with @upstash/redis REST client.
// We detect it and give a clear error message.
const tcpUrl = (process.env.KV_REDIS_URL ?? "").trim();

function assertRestConfigured() {
  if (!restUrl || !restToken) {
    if (tcpUrl) {
      throw new Error(
        "KV is configured with KV_REDIS_URL (TCP), but this app expects REST env vars (KV_REST_API_URL + KV_REST_API_TOKEN). In Vercel Storage, connect the database as KV/REST or expose REST env vars."
      );
    }
    throw new Error(
      "KV not configured. Missing REST env vars: KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN)."
    );
  }
  if (restUrl.includes("vercel.app")) {
    throw new Error(
      `KV_REST_API_URL is incorrectly set to a Vercel domain (${restUrl}). It must be an Upstash REST URL like https://xxxx.upstash.io.`
    );
  }
}

const rest = (() => {
  assertRestConfigured();
  return new UpstashRest({ url: restUrl, token: restToken });
})();

export const KV = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await rest.get<T>(key);
    return v ?? null;
  },
  async set(key: string, value: unknown) {
    await rest.set(key, value);
  },
  async lpush(key: string, value: unknown) {
    await rest.lpush(key, value);
  },
  async rpush(key: string, value: unknown) {
    await rest.rpush(key, value);
  },
  async lrange<T = unknown>(key: string, start: number, stop: number) {
    return (await rest.lrange<T>(key, start, stop)) ?? [];
  },
};
