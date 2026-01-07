// pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

// IMPORTANT: Stripe needs the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    readable.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

async function upsertSubscriptionForUser(params: {
  clerkUserId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string | null;
  priceId?: string | null;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean | null;
  plan?: string | null;
}) {
  const key = `sub:clerk:${params.clerkUserId}`;

  await kv.set(key, {
    clerkUserId: params.clerkUserId,
    stripeCustomerId: params.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
    status: params.status ?? null,
    priceId: params.priceId ?? null,
    currentPeriodEnd: params.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? null,
    plan: params.plan ?? null,
    updatedAt: new Date().toISOString(),
  });

  if (params.stripeCustomerId) {
    await kv.set(`sub:customer:${params.stripeCustomerId}`, params.clerkUserId);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!whsec) return res.status(500).json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET env var" });
  if (!secretKey) return res.status(500).json({ ok: false, error: "Missing STRIPE_SECRET_KEY env var" });

  const stripe = new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });

  const sig = req.headers["stripe-signature"];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).json({ ok: false, error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, whsec);
  } catch (err: any) {
    await kv.lpush("stripe:webhook:errors", {
      at: new Date().toISOString(),
      error: "Signature verification failed",
      message: err?.message ?? "unknown",
    });
    return res.status(400).json({ ok: false, error: `Signature verification failed: ${err?.message ?? "unknown"}` });
  }

  // Log received
  await kv.lpush("stripe:webhook:received", {
    at: new Date().toISOString(),
    id: event.id,
    type: event.type,
    created: event.created,
    via: "pages/api/stripe/webhook.ts",
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

        const clerkUserId = (session.metadata?.clerkUserId as string) || null;

        if (!clerkUserId) {
          await kv.lpush("stripe:webhook:unlinked", {
            at: new Date().toISOString(),
            type: event.type,
            eventId: event.id,
            stripeCustomerId,
            note: "Missing session.metadata.clerkUserId",
          });
          break;
        }

        const subId = typeof session.subscription === "string" ? session.subscription : null;

        await upsertSubscriptionForUser({
          clerkUserId,
          stripeCustomerId,
          stripeSubscriptionId: subId,
          status: "active",
          plan: session.metadata?.plan ?? "pro",
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const stripeCustomerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;

        let clerkUserId = (sub.metadata?.clerkUserId as string) || null;

        if (!clerkUserId && stripeCustomerId) {
          const customer = await stripe.customers.retrieve(stripeCustomerId);
          if (!("deleted" in customer) && customer.metadata?.clerkUserId) {
            clerkUserId = customer.metadata.clerkUserId;
          }
        }

        if (!clerkUserId) {
          await kv.lpush("stripe:webhook:unlinked", {
            at: new Date().toISOString(),
            type: event.type,
            eventId: event.id,
            stripeCustomerId,
            stripeSubscriptionId: sub.id,
            note: "Missing clerkUserId in subscription/customer metadata",
          });
          break;
        }

        const priceId = sub.items.data?.[0]?.price?.id ?? null;

        await upsertSubscriptionForUser({
          clerkUserId,
          stripeCustomerId,
          stripeSubscriptionId: sub.id,
          status: sub.status,
          priceId,
          currentPeriodEnd: sub.current_period_end ?? null,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? null,
          plan: sub.metadata?.plan ?? "pro",
        });

        break;
      }

      default:
        break;
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    await kv.lpush("stripe:webhook:errors", {
      at: new Date().toISOString(),
      error: "Webhook handler failed",
      message: err?.message ?? "unknown",
      eventType: event.type,
      eventId: event.id,
    });
    return res.status(500).json({ ok: false, error: err?.message ?? "Webhook handler failed" });
  }
}
