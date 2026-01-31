import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PATCH = "ROCKET_COCKPIT_IO_v1_20260131";
const STAMP = "D8IO_ROCKET_STAMP_20260131_215841";

export async function GET() {
  return NextResponse.json({
    ok: true,
    patch: PATCH,
    stamp: STAMP,
    at: new Date().toISOString(),
    note: "Rocket Cockpit proof endpoint."
  }, {
    headers: {
      "cache-control": "no-store",
      "x-d8io-patch": PATCH,
      "x-d8io-stamp": STAMP
    }
  });
}