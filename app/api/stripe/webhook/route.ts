// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { kv } from "@vercel/kv";

export const runtime = "nodejs"; // IMPORTANT for Stripe signature verification

// Stripe needs the *raw* body for signature verification.
// In Next.js App Router, Request gives you raw text via req.text().

function getClerkUserIdFromEvent(event: Stripe.Event): string | null {
  const obj: any = event.data.object;

  // Try common places
  if (obj?.metadata?.clerkUserId) return obj.metadata.clerkUserId;
  if (obj?.subscription_details?.metadata?.clerkUserId) return obj.subscription_details.metadata.clerkUserId;

  return null;
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

  // store a single JSON blob for the user
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

  // optional reverse index
  if (params.stripeCustomerId) {
    await kv.set(`sub:customer:${params.stripeCustomerId}`, params.clerkUserId);
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env var" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook signature verification failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  try {
    // We handle a few key events.
    switch (event.type) {
      // ✅ Most important for linking:
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

        // Prefer metadata on session; fallback to customer metadata if needed
        let clerkUserId = (session.metadata?.clerkUserId as string) || null;

        if (!clerkUserId && stripeCustomerId) {
          const customer = await stripe.customers.retrieve(stripeCustomerId);
          if (!("deleted" in customer) && customer.metadata?.clerkUserId) {
            clerkUserId = customer.metadata.clerkUserId;
          }
        }

        if (!clerkUserId) {
          // Store something so we can debug later, but don't crash the webhook
          await kv.lpush("stripe:webhook:unlinked", {
            type: event.type,
            id: event.id,
            created: event.created,
            stripeCustomerId,
          });
          break;
        }

        // Make SURE customer metadata is set (belt + suspenders)
        if (stripeCustomerId) {
          await stripe.customers.update(stripeCustomerId, {
            metadata: { clerkUserId },
          });
        }

        // Save minimal "paid" info.
        // Subscription id might not be on session in every case, so we store what we have now.
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

        const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;

        // Get clerkUserId from subscription metadata, else from customer metadata
        let clerkUserId = (sub.metadata?.clerkUserId as string) || null;

        if (!clerkUserId && stripeCustomerId) {
          const customer = await stripe.customers.retrieve(stripeCustomerId);
          if (!("deleted" in customer) && customer.metadata?.clerkUserId) {
            clerkUserId = customer.metadata.clerkUserId;
          }
        }

        if (!clerkUserId) {
          await kv.lpush("stripe:webhook:unlinked", {
            type: event.type,
            id: event.id,
            created: event.created,
            stripeCustomerId,
            stripeSubscriptionId: sub.id,
          });
          break;
        }

        const priceId =
          sub.items.data?.[0]?.price?.id ?? null;

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

      default: {
        // ignore other events
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Don't throw; respond 500 so Stripe retries
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Webhook handler failed" },
      { status: 500 }
    );
  }
}
