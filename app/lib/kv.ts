// app/lib/kv.ts

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getKvUrl(): string {
  return (
    getEnv("STORAGE_KV_REST_API_URL") ||
    getEnv("KV_REST_API_URL") ||
    getEnv("UPSTASH_REDIS_REST_URL") ||
    ""
  ).replace(/\/+$/, ""); // trim trailing slashes
}

function getKvToken(): string {
  return (
    getEnv("STORAGE_KV_REST_API_TOKEN") ||
    getEnv("KV_REST_API_TOKEN") ||
    getEnv("UPSTASH_REDIS_REST_TOKEN") ||
    ""
  );
}

function enc(x: string) {
  return encodeURIComponent(x);
}

async function requestJson(url: string): Promise<any> {
  const token = getKvToken();
  if (!token) throw new Error("Missing KV REST token env var.");

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || text || `${res.status}`;
    throw new Error(`KV request failed\nHTTP ${res.status}\nEndpoint: ${url}\n\nError: ${errMsg}`);
  }

  return data;
}

async function requestSet(url: string, value: string): Promise<any> {
  const token = getKvToken();
  if (!token) throw new Error("Missing KV REST token env var.");

  // Upstash: POST /set/<key> with body appended as the value argument. :contentReference[oaicite:1]{index=1}
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain; charset=utf-8",
    },
    body: value,
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || text || `${res.status}`;
    throw new Error(`KV set failed\nHTTP ${res.status}\nEndpoint: ${url}\n\nError: ${errMsg}`);
  }

  return data;
}

export const kv = {
  async get(key: string): Promise<string | null> {
    const base = getKvUrl();
    if (!base) throw new Error("Missing KV REST URL env var.");

    const url = `${base}/get/${enc(key)}`;
    const data = await requestJson(url);
    return data?.result ?? null;
  },

  async set(key: string, value: string): Promise<"OK"> {
    const base = getKvUrl();
    if (!base) throw new Error("Missing KV REST URL env var.");

    const url = `${base}/set/${enc(key)}`;
    const data = await requestSet(url, value);
    return data?.result as "OK";
  },

  async sadd(key: string, member: string): Promise<number> {
    const base = getKvUrl();
    if (!base) throw new Error("Missing KV REST URL env var.");

    const url = `${base}/sadd/${enc(key)}/${enc(member)}`;
    const data = await requestJson(url);
    return Number(data?.result ?? 0);
  },

  async smembers(key: string): Promise<string[]> {
    const base = getKvUrl();
    if (!base) throw new Error("Missing KV REST URL env var.");

    const url = `${base}/smembers/${enc(key)}`;
    const data = await requestJson(url);
    const result = data?.result;
    return Array.isArray(result) ? result.map((x: any) => String(x)) : [];
  },
};

export function kvNowISO(): string {
  return new Date().toISOString();
}

export async function kvJsonSet(key: string, value: unknown): Promise<void> {
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
