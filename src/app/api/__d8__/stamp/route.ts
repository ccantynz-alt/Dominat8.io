import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    stamp: "STAMP_TV_ROUTES_007_20260208_211257",
    utc: new Date().toISOString()
  }, { status: 200 });
}