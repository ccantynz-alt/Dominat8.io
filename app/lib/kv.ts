import { kv as vercelKv } from "@vercel/kv";

export const kv = vercelKv;

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
