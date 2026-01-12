import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { stripe } from "@/app/lib/stripe";
import { setUserPlan } from "@/app/lib/plan";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Stripe webhook route is deployed. POST is used for Stripe events.",
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  });
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_WEBHOOK_SECRET env var." },
      { status: 500 }
    );
  }

  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook signature verification failed: ${err?.message}` },
      { status: 400 }
    );
  }

  // Debug: record last event
  try {
    await kv.set("debug:lastStripeWebhook", {
      receivedAt: new Date().toISOString(),
      type: event.type,
      id: event.id,
    });
  } catch {}

  try {
    // ✅ Path A: checkout completed (if/when it arrives)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const clerkUserId =
        (session.metadata?.clerkUserId as string | undefined) ||
        (session.client_reference_id as string | undefined);

      try {
        await kv.set("debug:lastStripeCheckoutSession", {
          receivedAt: new Date().toISOString(),
          sessionId: session.id,
          clerkUserId: clerkUserId ?? null,
          metadata: session.metadata ?? null,
          client_reference_id: session.client_reference_id ?? null,
        });
      } catch {}

      if (clerkUserId) {
        await setUserPlan(clerkUserId, "pro");
      }

      return NextResponse.json({ ok: true, event: event.type, clerkUserId: clerkUserId ?? null }, { status: 200 });
    }

    // ✅ Path B: invoice paid (this is what you ARE receiving)
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      // invoice.customer can be a string customer id
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

      if (!customerId) {
        return NextResponse.json({ ok: true, event: event.type, note: "No customer id on invoice" }, { status: 200 });
      }

      const customer = await stripe.customers.retrieve(customerId);
      const clerkUserId = (customer as Stripe.Customer).metadata?.clerkUserId;

      // Debug: store what we found
      try {
        await kv.set("debug:lastStripeInvoicePaid", {
          receivedAt: new Date().toISOString(),
          invoiceId: invoice.id,
          customerId,
          clerkUserId: clerkUserId ?? null,
        });
      } catch {}

      if (clerkUserId) {
        await setUserPlan(clerkUserId, "pro");
      }

      return NextResponse.json({ ok: true, event: event.type, clerkUserId: clerkUserId ?? null }, { status: 200 });
    }

    return NextResponse.json({ ok: true, event: event.type }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}
