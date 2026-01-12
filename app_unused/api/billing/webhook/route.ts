import Stripe from "stripe";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

type BillingRecord = {
  plan: "free" | "pro";
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unknown";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number | null;
  updatedAt: string;
  sourceEvent?: { id: string; type: string };
};

function toStatus(s?: string | null): BillingRecord["status"] {
  switch (s) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "incomplete":
      return s;
    default:
      return "unknown";
  }
}

async function setUserBilling(clerkUserId: string, rec: BillingRecord) {
  await kv.set(`billing:user:${clerkUserId}`, rec);
}

async function linkCustomerToUser(stripeCustomerId: string, clerkUserId: string) {
  await kv.set(`billing:customer:${stripeCustomerId}`, {
    clerkUserId,
    linkedAt: new Date().toISOString(),
  });
}

async function getUserIdFromCustomer(stripeCustomerId: string): Promise<string | null> {
  const link = await kv.get<{ clerkUserId?: string }>(`billing:customer:${stripeCustomerId}`);
  return link?.clerkUserId ?? null;
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
    if (!process.env.STRIPE_WEBHOOK_SECRET) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing stripe-signature", { status: 400 });

    const body = await req.text();

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Always log last webhook
    await kv.set("billing:webhook:last", {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode,
      receivedAt: new Date().toISOString(),
    });

    // ---- IMPORTANT: handle checkout.session.completed FIRST (this creates the link) ----
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const clerkUserId = (session.metadata?.clerkUserId || "").trim();
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

      // Log what we actually received (so we can debug in webhook-health)
      await kv.set("billing:webhook:last_checkout", {
        eventId: event.id,
        type: event.type,
        clerkUserId: clerkUserId || null,
        customerId,
        subscriptionId,
        receivedAt: new Date().toISOString(),
      });

      // If metadata is missing, we cannot upgrade anyone — but we return 200 so Stripe stops retrying.
      if (!clerkUserId) {
        await kv.set("billing:webhook:last_billing", {
          type: event.type,
          id: event.id,
          warning: "Missing session.metadata.clerkUserId",
          receivedAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true });
      }

      if (customerId) {
        await linkCustomerToUser(customerId, clerkUserId);
      }

      let status: BillingRecord["status"] = "active";
      let currentPeriodEnd: number | null = null;

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        status = toStatus(sub.status);
        currentPeriodEnd = sub.current_period_end ?? null;
      }

      await setUserBilling(clerkUserId, {
        plan: "pro",
        status,
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId ?? undefined,
        currentPeriodEnd,
        updatedAt: new Date().toISOString(),
        sourceEvent: { id: event.id, type: event.type },
      });

      await kv.set("billing:webhook:last_billing", {
        type: event.type,
        id: event.id,
        clerkUserId,
        customerId,
        subscriptionId,
        status,
        receivedAt: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true });
    }

    // ---- Subscription events: upgrade/downgrade using the linked customer -> user mapping ----
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (!customerId) return NextResponse.json({ ok: true });

      const clerkUserId = await getUserIdFromCustomer(customerId);

      // Log what happened
      await kv.set("billing:webhook:last_subscription", {
        eventId: event.id,
        type: event.type,
        customerId,
        foundClerkUserId: clerkUserId,
        subscriptionId: sub.id,
        status: sub.status,
        receivedAt: new Date().toISOString(),
      });

      // If not linked yet, we can't apply billing to any user.
      if (!clerkUserId) {
        await kv.set("billing:webhook:last_billing", {
          type: event.type,
          id: event.id,
          customerId,
          subscriptionId: sub.id,
          warning: "No linked clerkUserId for customer (need checkout.session.completed with metadata)",
          receivedAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true });
      }

      const subStatus = toStatus(sub.status);
      const isActive = subStatus === "active" || subStatus === "trialing";

      await setUserBilling(clerkUserId, {
        plan: isActive ? "pro" : "free",
        status: subStatus,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: sub.current_period_end ?? null,
        updatedAt: new Date().toISOString(),
        sourceEvent: { id: event.id, type: event.type },
      });

      await kv.set("billing:webhook:last_billing", {
        type: event.type,
        id: event.id,
        clerkUserId,
        customerId,
        subscriptionId: sub.id,
        status: sub.status,
        receivedAt: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return new Response(`Webhook handler error: ${err?.message || "unknown"}`, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "Stripe webhook expects POST" });
}
