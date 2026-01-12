import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Not signed in." },
        { status: 401 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_PRO;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_PRICE_PRO env var." },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_APP_URL env var." },
        { status: 500 }
      );
    }

    // Create a Stripe Customer with clerkUserId attached
    const customer = await stripe.customers.create({
      metadata: { clerkUserId: userId },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,

      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,

      // also attach for good measure
      client_reference_id: userId,
      metadata: { clerkUserId: userId },

      success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
