import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const last = await kv.get<any>("billing:webhook:last");
  const lastBilling = await kv.get<any>("billing:webhook:last_billing");
  const lastCheckout = await kv.get<any>("billing:webhook:last_checkout");
  const lastSubscription = await kv.get<any>("billing:webhook:last_subscription");

  return NextResponse.json({
    ok: true,
    last: last ?? null,
    lastBilling: lastBilling ?? null,
    lastCheckout: lastCheckout ?? null,
    lastSubscription: lastSubscription ?? null,
  });
}
