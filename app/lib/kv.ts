// app/lib/kv.ts
// Minimal KV helpers used by API routes.
// Replace with Upstash / Vercel KV later if needed.

type Json = Record<string, any>;

const memory = new Map<string, Json>();

export function kvNowISO() {
  return new Date().toISOString();
}

export async function kvJsonGet<T = any>(key: string): Promise<T | null> {
  return (memory.get(key) as T) ?? null;
}

export async function kvJsonSet(key: string, value: Json) {
  memory.set(key, value);
}

export const kv = {
  async get(key: string) {
    return memory.get(key) ?? null;
  },
  async set(key: string, value: any) {
    memory.set(key, value);
  },
};
