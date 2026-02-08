import { NextResponse } from "next/server";

export const runtime = "nodejs";

function noCacheHeaders() {
  return {
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
  } as Record<string, string>;
}

// Storage strategy:
// 1) If KV env vars exist (Upstash-style), use REST calls.
// 2) Else return a clear error (because Vercel serverless FS isn't persistent).
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key: string) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  const r = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`KV get failed: ${r.status}`);
  const j: any = await r.json();
  return j?.result ?? null;
}

export async function GET() {
  const key = "d8:sites:v0";
  const hasKv = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);

  if (!hasKv) {
    return NextResponse.json({
      ok: false,
      error: "KV not configured (KV_REST_API_URL / KV_REST_API_TOKEN missing). Cannot persist sites on Vercel without KV/DB.",
      hint: "Create Vercel KV (or Upstash Redis) and set env vars, then retry.",
      sites: [],
    }, { headers: noCacheHeaders() });
  }

  const raw = await kvGet(key);
  const sites = raw ? JSON.parse(raw) : [];
  return NextResponse.json({ ok: true, sites }, { headers: noCacheHeaders() });
}