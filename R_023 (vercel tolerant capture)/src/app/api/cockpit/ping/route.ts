import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "cockpit",
    route: "/api/cockpit/ping",
    ts: Date.now(),
  });
}