import { kv as vercelKv } from "@vercel/kv";

/**
 * Preferred export (lowercase) used throughout this project.
 */
export const kv = vercelKv;

/**
 * Back-compat alias for older code that imports { KV }.
 * (Some files may still do: import { KV } from ".../lib/kv")
 */
export const KV = vercelKv;

export async function kvJsonGet<T>(key: string): Promise<T | null> {
  const value = await kv.get<T>(key);
  return value ?? null;
}

export async function kvJsonSet<T>(key: string, value: T): Promise<void> {
  await kv.set(key, value);
}

export async function kvNowISO(): Promise<string> {
  return new Date().toISOString();
}
