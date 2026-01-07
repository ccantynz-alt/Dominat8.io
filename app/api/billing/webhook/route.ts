import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Log last billing event for health check
  if (
    event.type === "checkout.session.completed" ||
    event.type.startsWith("customer.subscription.")
  ) {
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/_internal-log`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: event.type,
          id: event.id,
          receivedAt: new Date().toISOString(),
        }),
      }
    );
  }

  return NextResponse.json({ received: true });
}
