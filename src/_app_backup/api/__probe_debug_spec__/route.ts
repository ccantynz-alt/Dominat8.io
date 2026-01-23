import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "__probe_debug_spec__",
    nowIso: new Date().toISOString(),
  });
}
