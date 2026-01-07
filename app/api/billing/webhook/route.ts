// /app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_WEBHOOK_SECRET env var" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  // Always store last received event (any type)
  await kv.set("billing:webhook:last", {
    type: event.type,
    id: event.id,
    created: event.created,
    livemode: event.livemode,
    receivedAt: new Date().toISOString(),
  });

  // Also store last billing-critical events so invoices can't “overwrite” the proof
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

  const setPro = async (
    clerkUserId: string,
    stripeCustomerId?: string | null,
    subId?: string | null
  ) => {
    await kv.hset(`billing:user:${clerkUserId}`, {
      plan: "pro",
      stripeCustomerId: stripeCustomerId ?? "",
      stripeSubscriptionId: subId ?? "",
      updatedAt: new Date().toISOString(),
    });
  };

  const setFree = async (clerkUserId: string) => {
    await kv.hset(`billing:user:${clerkUserId}`, {
      plan: "free",
      stripeSubscriptionId: "",
      updatedAt: new Date().toISOString(),
    });
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.client_reference_id;

        if (clerkUserId) {
          await setPro(
            clerkUserId,
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null,
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata?.clerkUserId || "") as string;

        if (clerkUserId) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          if (isActive) {
            await setPro(
              clerkUserId,
              typeof sub.customer === "string"
                ? sub.customer
                : sub.customer?.id ?? null,
              sub.id
            );
          } else {
            await setFree(clerkUserId);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata?.clerkUserId || "") as string;

        if (clerkUserId) {
          await setFree(clerkUserId);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Webhook handler failed" }, { status: 500 });
  }
}
