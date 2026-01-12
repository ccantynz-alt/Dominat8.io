// app/api/ping/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, ping: true, time: new Date().toISOString() });
}
