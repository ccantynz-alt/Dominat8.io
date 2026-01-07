// /app/api/billing/webhook-health/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const last = await kv.get<any>("billing:webhook:last");
  return NextResponse.json({ ok: true, last: last ?? null });
}
