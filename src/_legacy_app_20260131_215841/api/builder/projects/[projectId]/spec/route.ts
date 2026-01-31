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

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  const projectId = ctx?.params?.projectId;
  const base = baseUrl();
  const target = base + "/api/builder/projects/" + encodeURIComponent(projectId || "") + "/spec";
  const startedAt = Date.now();

  if (!projectId) {
    return NextResponse.json({ ok: false, status: 400, stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662", error: "missing_projectId" }, { status: 200 });
  }

  try {
    const out = await fetchJson(target, { method: "GET", headers: { "accept": "application/json" } });
    return NextResponse.json({
      ok: out.ok,
      status: out.status,
      target,
      ms: Date.now() - startedAt,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
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
    }, { status: 200 });
  }
}

export async function PUT(req: Request, ctx: { params: { projectId: string } }) {
  const projectId = ctx?.params?.projectId;
  const base = baseUrl();
  const target = base + "/api/builder/projects/" + encodeURIComponent(projectId || "") + "/spec";
  const startedAt = Date.now();

  if (!projectId) {
    return NextResponse.json({ ok: false, status: 400, stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662", error: "missing_projectId" }, { status: 200 });
  }

  let body: any = null;
  try { body = await req.json(); } catch { body = {}; }

  // Expected: { spec: {...} }
  const spec = body?.spec || body;

  try {
    const out = await fetchJson(target, {
      method: "PUT",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({ spec }),
    });

    return NextResponse.json({
      ok: out.ok,
      status: out.status,
      target,
      ms: Date.now() - startedAt,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
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
    }, { status: 200 });
  }
}