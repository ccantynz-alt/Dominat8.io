import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, where: "app-router-api", ts: new Date().toISOString() });
}
