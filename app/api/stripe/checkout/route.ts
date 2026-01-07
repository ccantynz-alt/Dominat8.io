// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY env var" },
        { status: 500 }
      );
    }

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

    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan === "pro" ? "pro" : "pro";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      allow_promotion_codes: true,

      // ✅ Put clerkUserId on the session
      metadata: {
        clerkUserId: userId,
        plan,
      },

      // ✅ Put clerkUserId on the subscription
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          plan,
        },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
