/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;
const memory: Record<string, { v: Json; at: number }> = {};
function env(name: string) { return process.env[name] || ""; }
function hasUpstash() { return !!(env("KV_REST_API_URL") && env("KV_REST_API_TOKEN")); }

async function upstashGet(key: string): Promise<Json | null> {
  const url = env("KV_REST_API_URL"); const token = env("KV_REST_API_TOKEN");
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return null; const data = await res.json(); return data?.result ?? null;
}
async function upstashSet(key: string, value: Json): Promise<boolean> {
  const url = env("KV_REST_API_URL"); const token = env("KV_REST_API_TOKEN");
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(value ?? null),
    cache: "no-store",
  });
  return res.ok;
}

export async function kvGet(key: string): Promise<Json | null> {
  try { if (hasUpstash()) return await upstashGet(key); } catch {}
  const item = memory[key]; return item ? item.v : null;
}
export async function kvSet(key: string, value: Json): Promise<boolean> {
  try { if (hasUpstash()) return await upstashSet(key, value); } catch {}
  memory[key] = { v: value, at: Date.now() }; return true;
}

export function requireAdminToken(req: Request): { ok: true } | { ok: false; status: number; reason: string } {
  const token = (req.headers.get("x-admin-token") || req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const expected = env("ADMIN_TOKEN");
  if (!expected) return { ok: false, status: 500, reason: "ADMIN_TOKEN missing on server" };
  if (!token || token !== expected) return { ok: false, status: 401, reason: "Unauthorized (missing/invalid ADMIN token)" };
  return { ok: true };
}

export function hostInfo(req: Request) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  const proto = (req.headers.get("x-forwarded-proto") || "https").toLowerCase();
  return { host, proto };
}

export function allowApply(req: Request): { ok: true } | { ok: false; status: number; reason: string } {
  const { host } = hostInfo(req);
  if (host === "dominat8.com" || host === "www.dominat8.com") {
    return { ok: false, status: 403, reason: "APL apply blocked on production domain (sandbox-only)" };
  }
  const envGate = env("ALLOW_APL_APPLY");
  if (envGate.toLowerCase() !== "true") return { ok: false, status: 403, reason: "ALLOW_APL_APPLY not enabled (set to 'true' to allow apply)" };
  const ack = req.headers.get("x-dominat8-allow-apply") || "";
  if (ack !== "YES") return { ok: false, status: 403, reason: "Missing header x-dominat8-allow-apply: YES" };
  return { ok: true };
}

export function proofEnvelope(kind: string, data: any) {
  return { ok: true, kind, at: new Date().toISOString(), data };
}