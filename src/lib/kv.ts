/**
 * KV single entrypoint (Pages Router safe)
 *
 * This replaces the old import path: '@/src/lib/kv'
 * so we do NOT need src/app/ to exist (which would re-enable App Router).
 *
 * Supports:
 * - @vercel/kv (preferred)
 *
 * If kv cannot be loaded, we throw a clear error at runtime.
 */


function loadVercelKv(): any | null {
  try {
    const mod = require("@vercel/kv");
    return mod?.kv || null;
  } catch {
    return null;
  }
}

const kvImpl = loadVercelKv();

if (!kvImpl) {
  throw new Error(
    "KV not available. Expected @vercel/kv to be installed and configured. " +
      "Install/configure KV or provide a compatible kv client in src/lib/kv.ts."
  );
}

export const kv = kvImpl;
export async function kvJsonSet(key: string, value: any) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token) throw new Error("Missing KV REST env");
  const res = await fetch(url.replace(/\/$/, "") + `/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Upstash error ${res.status}: ${text.slice(0,200)}`);
  return { ok: true, key };
}

