// /app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Clerk (auth) — if your project uses Clerk (it does, per handover)
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

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

    // We use the request origin so this works on localhost + vercel
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    // Optional: If you later want to map Stripe customers to users,
    // store this session's customer ID in KV after webhook events.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      // This helps later when webhooks arrive:
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
      },
      // You can enable automatic tax later:
      // automatic_tax: { enabled: true },
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
