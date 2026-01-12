import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const lastWebhook = await kv.get("debug:lastStripeWebhook");
  const lastSession = await kv.get("debug:lastStripeCheckoutSession");

  return NextResponse.json({
    ok: true,
    lastWebhook,
    lastSession,
  });
}
