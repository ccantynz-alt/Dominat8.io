// app/lib/kv.ts
/**
 * KV helpers using a Redis URL (KV_REDIS_URL or REDIS_URL).
 *
 * This matches your current Vercel env setup:
 * - KV_REDIS_URL ✅
 * - REDIS_URL ✅
 *
 * It avoids @vercel/kv (which requires KV_REST_* vars you don't have).
 *
 * Exports:
 * - kv (get/set/del + a few common ops)
 * - kvJsonGet / kvJsonSet
 * - kvNowISO
 */

type AnyObj = Record<string, any>;

let _redis: any | null = null;
let _redisInitError: Error | null = null;

function hasText(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function envSummary() {
  return {
    KV_REDIS_URL: !!process.env.KV_REDIS_URL,
    REDIS_URL: !!process.env.REDIS_URL,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

async function getRedis() {
  if (_redis) return _redis;
  if (_redisInitError) throw _redisInitError;

  const url = process.env.KV_REDIS_URL || process.env.REDIS_URL;

  if (!hasText(url)) {
    const err = new Error(
      "Missing KV_REDIS_URL / REDIS_URL. Env present: " + JSON.stringify(envSummary())
    );
    _redisInitError = err;
    throw err;
  }

  try {
    // Dynamic import to avoid build-time issues in Next
    const mod: any = await import("ioredis");
    const Redis = mod?.default || mod;

    if (!Redis) {
      throw new Error("Could not import ioredis (missing default export).");
    }

    _redis = new Redis(url, {
      // Helps on serverless
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Simple health check (doesn't block forever)
    await _redis.ping();

    return _redis;
  } catch (e: any) {
    const err = new Error(
      "Redis client init failed using KV_REDIS_URL/REDIS_URL. " +
        "Ensure ioredis is installed and the URL is valid. Env present: " +
        JSON.stringify(envSummary())
    );
    (err as any).cause = e;
    _redisInitError = err;
    throw err;
  }
}

// A small kv facade that matches how you’ve been using it
export const kv: any = {
  async get(key: string) {
    const r = await getRedis();
    return r.get(key);
  },
  async set(key: string, value: string) {
    const r = await getRedis();
    return r.set(key, value);
  },
  async del(key: string) {
    const r = await getRedis();
    return r.del(key);
  },
  // Optional helpers (handy later)
  async exists(key: string) {
    const r = await getRedis();
    return r.exists(key);
  },
  async keys(pattern: string) {
    const r = await getRedis();
    return r.keys(pattern);
  },
};

export function kvNowISO() {
  return new Date().toISOString();
}

export async function kvJsonGet<T = any>(key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (raw == null) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  return raw as T;
}

export async function kvJsonSet(key: string, value: any) {
  const payload = JSON.stringify(value ?? null);
  return kv.set(key, payload);
}
