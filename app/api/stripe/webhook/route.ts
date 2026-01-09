import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { stripe } from "@/app/lib/stripe";
import { setUserPlan } from "@/app/lib/plan";

export const runtime = "nodejs";

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

  // Record last webhook event for debugging
  try {
    await kv.set("debug:lastStripeWebhook", {
      receivedAt: new Date().toISOString(),
      type: event.type,
      id: event.id,
    });
  } catch {
    // ignore debug write failures
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const clerkUserId =
        (session.metadata?.clerkUserId as string | undefined) ||
        (session.client_reference_id as string | undefined);

      // Record what we saw
      try {
        await kv.set("debug:lastStripeCheckoutSession", {
          receivedAt: new Date().toISOString(),
          sessionId: session.id,
          clerkUserId: clerkUserId ?? null,
          metadata: session.metadata ?? null,
          client_reference_id: session.client_reference_id ?? null,
        });
      } catch {
        // ignore debug write failures
      }

      if (!clerkUserId) {
        return NextResponse.json(
          { ok: false, error: "No clerkUserId found on session." },
          { status: 200 }
        );
      }

      await setUserPlan(clerkUserId, "pro");

      return NextResponse.json({ ok: true, event: event.type, clerkUserId }, { status: 200 });
    }

    return NextResponse.json({ ok: true, event: event.type }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}
