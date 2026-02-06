import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = { ok: true, stamp: "D8_IO_PR_FIX_044_20260207_070340", now: new Date().toISOString() };
  const res = NextResponse.json(body, { status: 200 });
  res.headers.set("X-D8-Proof", body.stamp);
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}