// app/lib/kv.ts
import { kv as vercelKv } from "@vercel/kv";

export const kv = vercelKv;

/**
 * Store JSON at a key.
 */
export async function kvJsonSet<T>(key: string, value: T) {
  await kv.set(key, value);
}

/**
 * Read JSON from a key.
 */
export async function kvJsonGet<T>(key: string): Promise<T | null> {
  const v = await kv.get<T>(key);
  return (v ?? null) as T | null;
}

/**
 * ISO timestamp (async to match your earlier usage).
 */
export async function kvNowISO(): Promise<string> {
  return new Date().toISOString();
}
