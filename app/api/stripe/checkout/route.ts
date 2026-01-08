import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "../_lib/stripe";

function getBaseUrl(req: Request) {
  const url = new URL(req.url);

  // If you have a custom domain, Vercel may pass x-forwarded-host.
  // Otherwise, fall back to the request URL host.
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Optional body fields (safe defaults)
    const body = await req.json().catch(() => ({} as any));
    const priceId = body?.priceId as string | undefined;

    // You should set STRIPE_PRICE_ID_PRO in Vercel env.
    const envPriceId = process.env.STRIPE_PRICE_ID_PRO;

    const finalPriceId = priceId || envPriceId;
    if (!finalPriceId) {
      return NextResponse.json(
        { ok: false, error: "Missing Stripe price id. Set STRIPE_PRICE_ID_PRO in env or pass { priceId }." },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);

    // Create a Stripe Checkout Session for a subscription.
    // Clerk userId is stored in metadata so the webhook can map Stripe -> Clerk.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: finalPriceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      metadata: {
        clerkUserId: userId,
      },
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
