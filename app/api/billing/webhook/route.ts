import Stripe from "stripe";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

// IMPORTANT: do NOT set apiVersion here to avoid TS/version mismatch issues
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing stripe-signature", { status: 400 });
    }

    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Always store last event so webhook-health proves delivery
    await kv.set("billing:webhook:last", {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode,
      receivedAt: new Date().toISOString(),
    });

    // Store last "billing" event separately
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await kv.set("billing:webhook:last_billing", {
        type: event.type,
        id: event.id,
        created: event.created,
        livemode: event.livemode,
        receivedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return new Response(`Webhook handler error: ${err?.message || "unknown"}`, {
      status: 400,
    });
  }
}

// Optional: having GET prevents confusion if you open it in a browser
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST only (Stripe webhook)" });
}
