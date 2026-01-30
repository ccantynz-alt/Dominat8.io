import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Default: local dev builder workspace
  // For production, set BUILDER_API_URL in Vercel env to your hosted builder API base.
  const base = process.env.BUILDER_API_URL || "http://127.0.0.1:8000";

  const target = base.replace(/\/+$/,"") + "/health";

  const startedAt = Date.now();
  try {
    const r = await fetch(target, {
      method: "GET",
      headers: { "accept": "application/json" },
      // Avoid caching in edge
      cache: "no-store",
    });

    const text = await r.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      target,
      ms: Date.now() - startedAt,
      result: json,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      status: 0,
      target,
      ms: Date.now() - startedAt,
      error: String(e?.message || e),
      hint: "If running locally, ensure builder-workspace uvicorn is running on 127.0.0.1:8000. In prod, set BUILDER_API_URL.",
    }, { status: 200 });
  }
}