// app/lib/kv.ts
type KvResult<T> = { result: T };

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getKvUrl(): string {
  return (
    getEnv("STORAGE_KV_REST_API_URL") ||
    getEnv("KV_REST_API_URL") ||
    getEnv("UPSTASH_REDIS_REST_URL") ||
    ""
  );
}

function getKvToken(): string {
  return (
    getEnv("STORAGE_KV_REST_API_TOKEN") ||
    getEnv("KV_REST_API_TOKEN") ||
    getEnv("UPSTASH_REDIS_REST_TOKEN") ||
    ""
  );
}

async function kvFetch<T>(path: string, args: unknown[]): Promise<T> {
  const base = getKvUrl();
  const token = getKvToken();

  if (!base || !token) {
    throw new Error(
      "Missing KV REST env vars. Need STORAGE_KV_REST_API_URL/TOKEN or KV_REST_API_URL/TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN)."
    );
  }

  // Upstash REST expects: POST {base}/{command} with JSON body: [arg1, arg2, ...]
  const url = `${base}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep as null
  }

  if (!res.ok) {
    const errMsg =
      data?.error ||
      data?.message ||
      text ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(
      `KV ${path} failed\nHTTP ${res.status}\nEndpoint: ${url}\n\nError: ${errMsg}`
    );
  }

  // Upstash returns { result: ... }
  return (data as KvResult<T>)?.result as T;
}

export const kv = {
  async get(key: string): Promise<string | null> {
    return await kvFetch<string | null>("get", [key]);
  },

  async set(key: string, value: string): Promise<"OK"> {
    // IMPORTANT: Must be [key, value]
    return await kvFetch<"OK">("set", [key, value]);
  },

  async sadd(key: string, member: string): Promise<number> {
    return await kvFetch<number>("sadd", [key, member]);
  },

  async smembers(key: string): Promise<string[]> {
    return await kvFetch<string[]>("smembers", [key]);
  },
};

export function kvNowISO(): string {
  return new Date().toISOString();
}

export async function kvJsonSet(key: string, value: unknown): Promise<void> {
  // Store JSON as a string (SET key "<json>")
  await kv.set(key, JSON.stringify(value));
}

export async function kvJsonGet<T>(key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
