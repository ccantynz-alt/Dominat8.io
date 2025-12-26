// app/lib/kv.ts
import { kv as vercelKv } from "@vercel/kv";

/**
 * The underlying KV client from @vercel/kv.
 * Some existing routes import this as `KV`, so we export both `kv` and `KV`.
 */
export const kv = vercelKv;
export const KV = vercelKv;

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
 * ISO timestamp (async to match earlier usage).
 */
export async function kvNowISO(): Promise<string> {
  return new Date().toISOString();
}
