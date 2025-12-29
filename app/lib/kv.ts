// app/lib/kv.ts
import "server-only";

type JsonValue = any;

function requiredEnvError() {
  return new Error(
    [
      "KV is not configured.",
      "",
      "Supported REST env var pairs:",
      "",
      "Unprefixed:",
      "  KV_REST_API_URL + KV_REST_API_TOKEN",
      "",
      "Prefixed (Vercel Storage):",
      "  STORAGE_KV_REST_API_URL + STORAGE_KV_REST_API_TOKEN",
      "",
      "Upstash REST:",
      "  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
    ].join("\n")
  );
}

function firstDefined(...vals: Array<string | undefined>) {
  for (const v of vals) {
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function envPair() {
  const url = firstDefined(
    process.env.KV_REST_API_URL,
    process.env.KV_URL,
    process.env.STORAGE_KV_REST_API_URL,
    process.env.STORAGE_KV_URL,
    process.env.UPSTASH_REDIS_REST_URL
  );

  const token = firstDefined(
    process.env.KV_REST_API_TOKEN,
    process.env.KV_REST_API_READ_ONLY_TOKEN,
    process.env.STORAGE_KV_REST_API_TOKEN,
    process.env.STORAGE_KV_REST_API_READ_ONLY_TOKEN,
    process.env.UPSTASH_REDIS_REST_TOKEN
  );

  return { url, token };
}

export function kvNowISO() {
  return new Date().toISOString();
}

async function rest<T>(command: string, ...args: any[]): Promise<T> {
  const { url, token } = envPair();
  if (!url || !token) throw requiredEnvError();

  const res = await fetch(`${url}/${command}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "KV request failed");

  return (json?.result ?? json) as T;
}

export const kv = {
  // string/value
  get: (key: string) => rest("get", key),
  set: (key: string, value: any) => rest("set", key, value),

  // list
  lpush: (key: string, value: any) => rest("lpush", key, value),
  rpop: (key: string) => rest("rpop", key),

  // set (✅ stable + simple)
  sadd: (key: string, ...members: string[]) => rest("sadd", key, ...members),
  smembers: (key: string) => rest<string[]>("smembers", key),
};

export async function kvJsonGet<T = JsonValue>(key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw as T;
    }
  }
  return raw as T;
}

export async function kvJsonSet(key: string, value: JsonValue) {
  return kv.set(key, JSON.stringify(value));
}
