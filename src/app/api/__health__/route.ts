import { NextResponse } from "next/server";
import { buildStamp } from "@/lib/buildStamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = buildStamp();
  return NextResponse.json({
    ok: true,
    service: "dominat8-io",
    ...s,
    nowIso: new Date().toISOString(),
  }, {
    headers: {
      "cache-control": "no-store, max-age=0",
    },
  });
}