import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

// Stripe requires the raw body for signature verification
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

async function setUserPlan(userId: string, plan: string) {
  await kv.set(`user:${userId}:plan`, plan);
}

async function storeCustomerId(userId: string, customerId: string) {
  await kv.set(`stripe:customer:${userId}`, customerId);
  await kv.set(`stripe:user:${customerId}`, userId);
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Payment completed → grant plan access ──────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId = session.customer as string;

        if (userId && plan) {
          await setUserPlan(userId, plan);
        }
        if (userId && customerId) {
          await storeCustomerId(userId, customerId);
        }
        break;
      }

      // ── Subscription updated (upgrade/downgrade) ───────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.userId ??
          (await kv.get<string>(`stripe:user:${sub.customer}`));

        if (userId) {
          const plan = sub.metadata?.plan;
          if (sub.status === "active" && plan) {
            await setUserPlan(userId, plan);
          } else if (sub.status !== "active") {
            await setUserPlan(userId, "free");
          }
        }
        break;
      }

      // ── Subscription cancelled → downgrade to free ─────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.userId ??
          (await kv.get<string>(`stripe:user:${sub.customer}`));

        if (userId) {
          await setUserPlan(userId, "free");
        }
        break;
      }

      // ── Payment failed → could notify user, for now just log ──────────
      case "invoice.payment_failed": {
        // Future: send email, mark account as past-due
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
