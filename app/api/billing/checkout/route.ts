// /app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/app/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Only await inside the handler (NOT top-level)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!proPriceId) {
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_PRO_PRICE_ID env var" },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,

      // ✅ map Stripe -> Clerk user
      client_reference_id: userId,

      // ✅ store on subscription for later webhook events
      subscription_data: {
        metadata: {
          clerkUserId: userId,
        },
      },

      metadata: {
        clerkUserId: userId,
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}

