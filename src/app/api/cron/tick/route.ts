import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/cron/tick",
    ts: new Date().toISOString(),
  });
}
