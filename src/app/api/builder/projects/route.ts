import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return (process.env.BUILDER_API_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");
}

async function fetchJson(url: string, init?: RequestInit) {
  const r = await fetch(url, { cache: "no-store", ...init });
  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: r.ok, status: r.status, json };
}

export async function POST(req: Request) {
  const base = baseUrl();
  const target = base + "/api/builder/projects";
  const startedAt = Date.now();

  let body: any = null;
  try { body = await req.json(); } catch { body = {}; }

  const name = (body?.name && String(body.name).trim()) ? String(body.name).trim() : "Dominat8 Project";

  try {
    const out = await fetchJson(target, {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({ name }),
    });

    return NextResponse.json({
      ok: out.ok,
      status: out.status,
      target,
      ms: Date.now() - startedAt,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
      request: { name },
      result: out.json,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      status: 0,
      target,
      ms: Date.now() - startedAt,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
      error: String(e?.message || e),
      hint: "Ensure Builder is running OR set BUILDER_API_URL.",
    }, { status: 200 });
  }
}