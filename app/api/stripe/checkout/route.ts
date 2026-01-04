import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for a subscription.
 */
export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!priceId) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  if (!appUrl) {
    return NextResponse.json({ ok: false, error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });
  }

  // Stripe Checkout for subscriptions uses mode: "subscription" and line_items price IDs :contentReference[oaicite:3]{index=3}
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    // Store Clerk userId in metadata (very common pattern) :contentReference[oaicite:4]{index=4}
    metadata: {
      clerkUserId: userId,
    },
  });

  return NextResponse.json({ ok: true, url: session.url });
}
