import { NextResponse } from "next/server";
import { buildStamp } from "@/lib/buildStamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = buildStamp();
  return NextResponse.json({
    ok: true,
    patch: "IO_ROCKET_COCKPIT",
    ...s,
  }, {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}