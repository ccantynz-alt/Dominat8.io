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
    return NextResponse.json({ ok: false, error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  // ✅ Always store last webhook received (for debugging)
  try {
    await kv.set("billing:webhook:last", {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode,
      receivedAt: new Date().toISOString(),
    });
  } catch (e) {
    // Don't fail the webhook if debug storage fails
    console.warn("Failed to write billing:webhook:last");
  }

  // Helpers to update KV
  const setPro = async (clerkUserId: string, stripeCustomerId?: string | null, subId?: string | null) => {
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

        // We set this in checkout: client_reference_id = Clerk userId
        const clerkUserId = session.client_reference_id;

        if (clerkUserId) {
          await setPro(
            clerkUserId,
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null
          );
        } else {
          console.warn("checkout.session.completed missing client_reference_id");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        // We set this in checkout via subscription_data.metadata
        const clerkUserId = (sub.metadata?.clerkUserId || "") as string;

        if (clerkUserId) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          if (isActive) {
            await setPro(
              clerkUserId,
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
              sub.id
            );
          } else {
            await setFree(clerkUserId);
          }
        } else {
          console.warn("subscription event missing metadata.clerkUserId");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata?.clerkUserId || "") as string;

        if (clerkUserId) {
          await setFree(clerkUserId);
        } else {
          console.warn("subscription.deleted missing metadata.clerkUserId");
        }
        break;
      }

      default:
        // ignore
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ ok: false, error: "Webhook handler failed" }, { status: 500 });
  }
}
