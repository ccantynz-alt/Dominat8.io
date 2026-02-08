import { NextResponse } from "next/server";

export const runtime = "nodejs";

function noCacheHeaders() {
  return {
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
  } as Record<string, string>;
}

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key: string) {
  const r = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`KV get failed: ${r.status}`);
  const j: any = await r.json();
  return j?.result ?? null;
}

async function kvSet(key: string, value: string) {
  const r = await fetch(`${KV_REST_API_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
  const j: any = await r.json();
  return j?.result ?? null;
}

function sanitizeUrl(u: string) {
  try {
    const x = new URL(u);
    x.hash = "";
    return x.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const hasKv = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);
  if (!hasKv) {
    return NextResponse.json({
      ok: false,
      error: "KV not configured (KV_REST_API_URL / KV_REST_API_TOKEN missing). Cannot persist sites on Vercel without KV/DB.",
    }, { headers: noCacheHeaders() });
  }

  const body: any = await req.json().catch(() => ({}));
  const url = sanitizeUrl(String(body?.url || ""));
  const notes = String(body?.notes || "").slice(0, 500);
  const platformHint = String(body?.platformHint || "").slice(0, 40);

  if (!url) {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { headers: noCacheHeaders() });
  }

  const key = "d8:sites:v0";
  const raw = await kvGet(key);
  const sites = raw ? JSON.parse(raw) : [];

  const id = "site_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  const item = { id, url, notes, platformHint, createdAt: new Date().toISOString() };
  sites.unshift(item);

  await kvSet(key, JSON.stringify(sites));
  return NextResponse.json({ ok: true, item }, { headers: noCacheHeaders() });
}