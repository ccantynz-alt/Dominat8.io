import { NextResponse } from "next/server";
import { nowISO } from "../../../../lib/runs";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, message: "tick ok", ts: nowISO() });
}
