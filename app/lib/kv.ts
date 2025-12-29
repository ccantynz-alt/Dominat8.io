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
      "Set ONE of the following PAIRS in Vercel Environment Variables (Production):",
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
      `  - KV_REST_API_URL present: ${!!process.env.KV_REST_API_URL || !!process.env.VERCEL_KV_REST_API_URL}`,
      `  - KV_REST_API_TOKEN present: ${!!process.env.KV_REST_API_TOKEN || !!process.env.VERCEL_KV_REST_API_TOKEN}`,
      `  - UPSTASH_REDIS_REST_URL present: ${!!process.env.UPSTASH_REDIS_REST_URL}`,
      `  - UPSTASH_REDIS_REST_TOKEN present: ${!!process.env.UPSTASH_REDIS_REST_TOKEN}`,
      `  - REDIS_URL present: ${!!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_URL}`,
      "",
      "Note: URLs without their matching tokens are not usable.",
    ].join("\n")
  );
}

function pickEnvPair() {
  const KV_URL = process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL || "";
  const KV_TOKEN =
    process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN || "";

  const UP_URL = process.env.UPSTASH_REDIS_REST_URL || "";
  const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

  // Prefer a complete KV pair, otherwise a complete Upstash pair.
  if (KV_URL && KV_TOKEN) return { url: KV_URL, token: KV_TOKEN, provider: "vercel-kv" as const };
  if (UP_URL && UP_TOKEN) return { url: UP_URL, token: UP_TOKEN, provider: "upstash" as const };

  return { url: "", token: "", provider: "none" as const };
}

export function kvNowISO() {
  return new Date().toISOString();
}

async function rest<T>(command: string, ...args: any[]): Promise<T> {
  const { url, token } = pickEnvPair();
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
