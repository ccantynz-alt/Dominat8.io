/* ============================================================================
   ALE KV helpers
   - Used by server route handlers under /app/api/...
   - Provides:
       kvGetJson(key): fetch JSON from Upstash REST
       requireAdmin(req): returns NextResponse if unauthorized, else null
   NOTE: This module exists to keep routes compiling and stable.
============================================================================ */

import { NextResponse } from "next/server";

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function getAdminSecret(): string | undefined {
  return (
    getEnv("ALE_ADMIN_TOKEN") ||
    getEnv("D8_ADMIN_TOKEN") ||
    getEnv("ADMIN_TOKEN")
  );
}

function getUpstash(): { url: string; token: string } | null {
  const url =
    getEnv("KV_REST_API_URL") ||
    getEnv("UPSTASH_REDIS_REST_URL") ||
    getEnv("UPSTASH_REST_URL");
  const token =
    getEnv("KV_REST_API_TOKEN") ||
    getEnv("UPSTASH_REDIS_REST_TOKEN") ||
    getEnv("UPSTASH_REST_TOKEN");

  if (!url || !token) return null;
  return { url, token };
}

function readTokenFromReq(req: Request): string | undefined {
  const h = req.headers;

  const direct = h.get("x-admin-token") || undefined;
  if (direct && direct.trim()) return direct.trim();

  const auth = h.get("authorization") || undefined;
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    const t = auth.slice(7).trim();
    if (t) return t;
  }
  return undefined;
}

/**
 * If unauthorized, returns a NextResponse with 401/403. If authorized, returns null.
 * This pattern keeps route handlers simple:
 *   const deny = requireAdmin(req); if (deny) return deny;
 */
export function requireAdmin(req: Request): NextResponse | null {
  const secret = getAdminSecret();
  const token = readTokenFromReq(req);

  if (!secret) {
    // If no secret is configured, default to locked-down.
    return NextResponse.json(
      { ok: false, error: "Admin token not configured (set ALE_ADMIN_TOKEN / D8_ADMIN_TOKEN / ADMIN_TOKEN)." },
      { status: 401 }
    );
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing admin token." }, { status: 401 });
  }

  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid admin token." }, { status: 403 });
  }

  return null;
}

/**
 * Fetch a JSON value from Upstash REST.
 * Returns:
 *   - parsed JSON object if value is a JSON string
 *   - raw string if not JSON
 *   - null if key missing
 */
export async function kvGetJson<T = unknown>(key: string): Promise<T | string | null> {
  const up = getUpstash();
  if (!up) {
    throw new Error("KV REST not configured (set KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).");
  }

  const r = await fetch(`${up.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${up.token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Upstash GET failed: ${r.status} ${r.statusText} ${t}`.trim());
  }

  const j: any = await r.json().catch(() => null);
  const val = j?.result;

  if (val === null || val === undefined) return null;

  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return "";
    try {
      return JSON.parse(s) as T;
    } catch {
      return val;
    }
  }

  // Upstash usually returns strings, but keep this safe:
  return val as T;
}
/**
 * Set a JSON value in Upstash REST.
 * Stores JSON.stringify(value) at key.
 */
export async function kvSetJson(key: string, value: unknown): Promise<boolean> {
  const up = (function getUpstashInline(): { url: string; token: string } | null {
    const url =
      (process.env["KV_REST_API_URL"] && process.env["KV_REST_API_URL"].trim()) ||
      (process.env["UPSTASH_REDIS_REST_URL"] && process.env["UPSTASH_REDIS_REST_URL"].trim()) ||
      (process.env["UPSTASH_REST_URL"] && process.env["UPSTASH_REST_URL"].trim());
    const token =
      (process.env["KV_REST_API_TOKEN"] && process.env["KV_REST_API_TOKEN"].trim()) ||
      (process.env["UPSTASH_REDIS_REST_TOKEN"] && process.env["UPSTASH_REDIS_REST_TOKEN"].trim()) ||
      (process.env["UPSTASH_REST_TOKEN"] && process.env["UPSTASH_REST_TOKEN"].trim());
    if (!url || !token) return null;
    return { url, token };
  })();

  if (!up) {
    throw new Error(
      "KV REST not configured (set KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN)."
    );
  }

  const body = JSON.stringify(value ?? null);

  // Upstash REST supports /set/<key>/<value> (value urlencoded)
  const r = await fetch(`${up.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(body)}`, {
    headers: { Authorization: `Bearer ${up.token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Upstash SET failed: ${r.status} ${r.statusText} ${t}`.trim());
  }

  const j: any = await r.json().catch(() => null);
  // Upstash returns { result: "OK" } on success (usually)
  return (j?.result === "OK") || (j?.result === true) || (typeof j?.result === "string");
}

