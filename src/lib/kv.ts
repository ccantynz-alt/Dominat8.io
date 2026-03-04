/**
 * KV single entrypoint
 *
 * Supports @vercel/kv (preferred).
 *
 * If KV cannot be loaded, exports a lazy proxy that throws on first USE
 * rather than at module-import time. This prevents the kv import from
 * crashing pages or API routes that never actually call KV.
 */

function loadVercelKv(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@vercel/kv");
    return mod?.kv || null;
  } catch {
    return null;
  }
}

const kvImpl = loadVercelKv();

// Lazy proxy: if kv module isn't available, any actual KV call will throw
// a clear error — but merely importing this module won't crash the app.
function kvUnavailable(): never {
  throw new Error(
    "KV not available. Expected @vercel/kv with KV_REST_API_URL & KV_REST_API_TOKEN configured."
  );
}

export const kv: any = kvImpl ?? new Proxy({} as any, {
  get(_target, prop) {
    // Allow typeof checks and symbol access without throwing
    if (typeof prop === "symbol" || prop === "then") return undefined;
    return (...args: any[]) => { void args; kvUnavailable(); };
  },
});

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
