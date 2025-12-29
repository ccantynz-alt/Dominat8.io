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
      "Set ONE of the following in Vercel Environment Variables (Production):",
      "",
      "Option A (Vercel KV REST):",
      "  - KV_REST_API_URL",
      "  - KV_REST_API_TOKEN",
      "",
      "Option B (Upstash REST):",
      "  - UPSTASH_REDIS_REST_URL",
      "  - UPSTASH_REDIS_REST_TOKEN",
      "",
      "Current env detected:",
      `  - REDIS_URL present: ${!!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_URL}`,
      `  - Any REST configured: false`,
      "",
      "Note: REDIS_URL alone is not usable for the REST KV client used by this app.",
    ].join("\n")
  );
}

function env() {
  const KV_URL = process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL || "";
  const KV_TOKEN =
    process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN || "";

  const UP_URL = process.env.UPSTASH_REDIS_REST_URL || "";
  const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

  const url = KV_URL || UP_URL;
  const token = KV_TOKEN || UP_TOKEN;

  return { url, token };
}

export function kvNowISO() {
  return new Date().toISOString();
}

async function rest<T>(command: string, ...args: any[]): Promise<T> {
  const { url, token } = env();
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

  // Upstash/Vercel KV REST returns { result: ... }
  return (json?.result ?? json) as T;
}

export const kv = {
  // Allowed: get, set, zadd, zrange, lpush, rpop
  async get(key: string) {
    return rest<any>("get", key);
  },

  async set(key: string, value: any) {
    return rest<any>("set", key, value);
  },

  async zadd(key: string, arg: ZAddArg) {
    if (Array.isArray(arg)) {
      // zadd key score member score member...
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
      // If it wasn't JSON, return as-is
      return raw as any as T;
    }
  }

  return raw as T;
}

export async function kvJsonSet(key: string, value: JsonValue) {
  // Store as JSON string for consistent behavior
  return kv.set(key, JSON.stringify(value));
}
