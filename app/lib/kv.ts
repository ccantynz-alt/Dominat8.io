// app/lib/kv.ts
import "server-only";

type ZAddArg =
  | { score: number; member: string }
  | Array<{ score: number; member: string }>;

type JsonValue = any;

function requiredEnvError() {
  return new Error(
    [
      "KV is not configured.",
      "",
      "This project can be configured via ONE of these REST pairs:",
      "",
      "Unprefixed (recommended):",
      "  - KV_REST_API_URL + KV_REST_API_TOKEN",
      "",
      "Prefixed (if your Vercel integration forces a prefix like STORAGE):",
      "  - STORAGE_KV_REST_API_URL + STORAGE_KV_REST_API_TOKEN",
      "",
      "Upstash REST (alternative):",
      "  - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
      "",
      "Redeploy after changing env vars or storage connections.",
    ].join("\n")
  );
}

function firstDefined(...vals: Array<string | undefined>) {
  for (const v of vals) {
    if (v && v.trim().length > 0) return v.trim();
  }
  return "";
}

function envPair() {
  // URL sources
  const url = firstDefined(
    // Unprefixed KV
    process.env.KV_REST_API_URL,
    process.env.KV_URL,

    // Prefixed KV (your forced STORAGE prefix)
    process.env.STORAGE_KV_REST_API_URL,
    process.env.STORAGE_KV_URL,

    // Legacy Vercel KV names
    process.env.VERCEL_KV_REST_API_URL,

    // Upstash REST names
    process.env.UPSTASH_REDIS_REST_URL
  );

  // TOKEN sources
  const token = firstDefined(
    // Unprefixed KV
    process.env.KV_REST_API_TOKEN,
    process.env.KV_REST_API_READ_ONLY_TOKEN,

    // Prefixed KV
    process.env.STORAGE_KV_REST_API_TOKEN,
    process.env.STORAGE_KV_REST_API_READ_ONLY_TOKEN,

    // Legacy Vercel KV names
    process.env.VERCEL_KV_REST_API_TOKEN,

    // Upstash REST names
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

  if (!res.ok) {
    const msg =
      json?.error ||
      json?.message ||
      `KV request failed: ${command} (${res.status})`;
    throw new Error(msg);
  }

  return (json?.result ?? json) as T;
}

export const kv = {
  // Allowed ops: get, set, zadd, zrange, lpush, rpop
  async get(key: string) {
    return rest<any>("get", key);
  },

  async set(key: string, value: any) {
    return rest<any>("set", key, value);
  },

  async zadd(key: string, arg: ZAddArg) {
    if (Array.isArray(arg)) {
      const flat: any[] = [];
      for (const item of arg) flat.push(item.score, item.member);
      return rest<any>("zadd", key, ...flat);
    }
    return rest<any>("zadd", key, arg.score, arg.member);
  },

  async zrange(key: string, start: number, stop: number) {
    return rest<any>("zrange", key, start, stop);
  },

  async lpush(key: string, value: any) {
    return rest<any>("lpush", key, value);
  },

  async rpop(key: string) {
    return rest<any>("rpop", key);
  },
};

export async function kvJsonGet<T = JsonValue>(key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (raw == null) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as any as T;
    }
  }

  return raw as T;
}

export async function kvJsonSet(key: string, value: JsonValue) {
  return kv.set(key, JSON.stringify(value));
}
