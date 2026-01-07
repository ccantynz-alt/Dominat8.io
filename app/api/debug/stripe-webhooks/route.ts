// app/api/debug/stripe-webhooks/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function GET() {
  const received = await kv.lrange("stripe:webhook:received", 0, 20).catch(() => []);
  const errors = await kv.lrange("stripe:webhook:errors", 0, 20).catch(() => []);
  const unlinked = await kv.lrange("stripe:webhook:unlinked", 0, 20).catch(() => []);

  return NextResponse.json({
    ok: true,
    receivedCount: Array.isArray(received) ? received.length : 0,
    errorsCount: Array.isArray(errors) ? errors.length : 0,
    unlinkedCount: Array.isArray(unlinked) ? unlinked.length : 0,
    received,
    errors,
    unlinked,
  });
}
