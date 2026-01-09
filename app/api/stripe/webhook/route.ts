import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { setUserPlan } from "@/app/lib/plan";

export const runtime = "nodejs";

// Stripe needs the RAW body for signature verification
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

  try {
    // When checkout completes successfully, mark that user as pro
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const clerkUserId =
        (session.metadata?.clerkUserId as string | undefined) ||
        (session.client_reference_id as string | undefined);

      if (!clerkUserId) {
        return NextResponse.json(
          { ok: false, error: "No clerkUserId found on session." },
          { status: 400 }
        );
      }

      await setUserPlan(clerkUserId, "pro");

      return NextResponse.json({ ok: true, event: event.type, clerkUserId });
    }

    // (Optional) If subscription is canceled, set back to free
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;

      // If you later store clerkUserId on the customer/subscription metadata, you can downgrade here.
      // For now we just acknowledge the event.
      return NextResponse.json({ ok: true, event: event.type, subscriptionId: sub.id });
    }

    return NextResponse.json({ ok: true, event: event.type });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}
