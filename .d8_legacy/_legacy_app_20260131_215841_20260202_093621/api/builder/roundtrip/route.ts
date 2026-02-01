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
  const startedAt = Date.now();

  let body: any = null;
  try { body = await req.json(); } catch { body = {}; }

  const name = (body?.name && String(body.name).trim()) ? String(body.name).trim() : "Dominat8 Roundtrip";
  const specOverride = body?.spec;

  const createUrl = base + "/api/builder/projects";

  try {
    // 1) Create project
    const created = await fetchJson(createUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({ name }),
    });

    const projectId =
      created?.json?.project?.projectId ||
      created?.json?.projectId ||
      created?.json?.project?.id ||
      null;

    if (!created.ok || !projectId) {
      return NextResponse.json({
        ok: false,
        stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
        step: "create_project_failed",
        ms: Date.now() - startedAt,
        create: created,
      }, { status: 200 });
    }

    // 2) Save spec (sample or override)
    const sampleSpec = specOverride || {
      version: "1",
      theme: { vibe: "c-first-hybrid", accent: "electric" },
      pages: [
        { path: "/", title: "Home", sections: [
          { kind: "hero", headline: "This is how websites are made now.", subhead: "Built by Dominat8 (round-trip proof)." },
          { kind: "cta", primary: "Build my site", secondary: "View pricing" }
        ] }
      ]
    };

    const saveUrl = base + "/api/builder/projects/" + encodeURIComponent(projectId) + "/spec";
    const saved = await fetchJson(saveUrl, {
      method: "PUT",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({ spec: sampleSpec }),
    });

    // 3) Re-fetch spec
    const fetched = await fetchJson(saveUrl, { method: "GET", headers: { "accept": "application/json" } });

    return NextResponse.json({
      ok: created.ok && saved.ok && fetched.ok,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
      ms: Date.now() - startedAt,
      builderBase: base,
      projectId,
      create: created,
      save: saved,
      fetch: fetched,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      stamp: "D8_BUILDER_ROUNDTRIP_2026-01-30_7662",
      ms: Date.now() - startedAt,
      error: String(e?.message || e),
      hint: "Ensure Builder is running locally or set BUILDER_API_URL.",
    }, { status: 200 });
  }
}