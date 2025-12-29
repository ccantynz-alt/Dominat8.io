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

  const endpoint = `${url}/${command}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const raw = await res.text().catch(() => "");
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errMsg =
      json?.error ||
      json?.message ||
      (raw ? raw.slice(0, 300) : "") ||
      "KV request failed";

    throw new Error(
      [
        `KV ${command} failed`,
        `HTTP ${res.status}`,
        `Endpoint: ${endpoint}`,
        "",
        `Error: ${errMsg}`,
      ].join("\n")
    );
  }

  return (json?.result ?? json) as T;
}

export const kv = {
  get: (key: string) => rest("get", key),
  set: (key: string, value: any) => rest("set", key, value),
  zadd: (key: string, arg: ZAddArg) =>
    Array.isArray(arg)
      ? rest("zadd", key, ...arg.flatMap((i) => [i.score, i.member]))
      : rest("zadd", key, arg.score, arg.member),
  zrange: (key: string, start: number, stop: number) =>
    rest("zrange", key, start, stop),

  // ✅ Set ops used by the app/store layer
  sadd: (key: string, ...members: string[]) => rest("sadd", key, ...members),
  smembers: (key: string) => rest("smembers", key),

  lpush: (key: string, value: any) => rest("lpush", key, value),
  rpop: (key: string) => rest("rpop", key),
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
