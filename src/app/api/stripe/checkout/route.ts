import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Map plan names to Stripe Price IDs (set in env vars)
const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  agency: process.env.STRIPE_AGENCY_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { plan } = await req.json();
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan or price not configured" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dominat8.io";

  // Check if this user already has a Stripe customer ID
  let customerId: string | undefined;
  try {
    const stored = await kv.get<string>(`stripe:customer:${userId}`);
    if (stored) customerId = stored;
  } catch {
    // KV not available — continue without customer reuse
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?payment=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?cancelled=1`,
    client_reference_id: userId,
    ...(customerId ? { customer: customerId } : {}),
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
