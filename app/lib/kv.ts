import { createClient } from "@vercel/kv";

/**
 * This Vercel KV store is connected with the prefix "STORAGE"
 * so Vercel provides:
 * - STORAGE_REST_API_URL
 * - STORAGE_REST_API_TOKEN
 */
export const kv = createClient({
  url: process.env.STORAGE_REST_API_URL!,
  token: process.env.STORAGE_REST_API_TOKEN!,
});

export async function kvJsonGet<T>(key: string): Promise<T | null> {
  const v = await kv.get(key);
  if (v == null) return null;

  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }
  return v as T;
}

export async function kvJsonSet(key: string, value: any) {
  await kv.set(key, JSON.stringify(value));
}

export function kvNowISO() {
  return new Date().toISOString();
}
