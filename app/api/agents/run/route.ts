import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({
    ok: false,
    error: "Agent temporarily disabled during stabilization",
  });
}
