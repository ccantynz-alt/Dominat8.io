import "server-only";
import { kv as vercelKv } from "@vercel/kv";

/**
 * Vercel KV wrapper.
 * Keeping this file small + server-only prevents accidental client imports.
 */
export const kv = vercelKv;

export async function kvJsonGet<T = unknown>(key: string): Promise<T | null> {
  const value = await kv.get<T>(key);
  return (value ?? null) as T | null;
}

export async function kvJsonSet(
  key: string,
  value: unknown,
  opts?: { ex?: number }
) {
  if (opts?.ex) {
    return kv.set(key, value as any, { ex: opts.ex });
  }
  return kv.set(key, value as any);
}

export async function kvDel(key: string) {
  return kv.del(key);
}
