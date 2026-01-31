// AI_WEB_BUILDER_ENGINE_PATCH_RUN_ROUTE_RELATIVE_SRC_LIB_2026-01-29
import { NextResponse } from "next/server";
import { runPatchRunner } from "../../../../../src/lib/engine/patchRunner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function headers() {
  return {
    "x-ai-web-builder-engine": "PATCH_RUN_WIRED",
    "x-ai-web-builder-route": "/api/engine/patch-run",
    "x-ai-web-builder-stamp": "AI_WEB_BUILDER_ENGINE_PATCH_RUN_ROUTE_RELATIVE_SRC_LIB_2026-01-29",
    "cache-control": "no-store",
  } as Record<string, string>;
}

export async function GET() {
  return NextResponse.json(
    { ok: true, wired: true, stamp: "AI_WEB_BUILDER_ENGINE_PATCH_RUN_ROUTE_RELATIVE_SRC_LIB_2026-01-29" },
    { status: 200, headers: headers() }
  );
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  try {
    const result = await runPatchRunner(body || {});
    return NextResponse.json(result, { status: result.ok ? 200 : 400, headers: headers() });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, stamp: "AI_WEB_BUILDER_ENGINE_PATCH_RUN_ROUTE_RELATIVE_SRC_LIB_2026-01-29", error: (e && e.message) ? e.message : String(e) },
      { status: 500, headers: headers() }
    );
  }
}