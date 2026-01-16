// BOOTSTRAP/app/api/__probe_debug_spec__/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "BOOTSTRAP/app/api/__probe_debug_spec__/route.ts",
    nowIso: new Date().toISOString(),
  });
}
