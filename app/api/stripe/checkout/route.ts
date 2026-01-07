// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "../../../../lib/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = body?.plan === "pro" ? "pro" : "pro"; // keep simple for now

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_PRICE_PRO_MONTHLY env var" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_APP_URL env var" },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing/cancel`,
    allow_promotion_codes: true,

    // ✅ Put clerkUserId on session metadata
    metadata: {
      clerkUserId: userId,
      plan,
    },

    // ✅ Also put clerkUserId on the subscription metadata
    subscription_data: {
      metadata: {
        clerkUserId: userId,
        plan,
      },
    },

    // ✅ Ensure a customer is created (Stripe will create one for subscriptions anyway)
    customer_creation: "always",
  });

  return NextResponse.json({ ok: true, url: session.url });
}
