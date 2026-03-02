/**
 * POST /api/stripe/credits
 *
 * Creates a Stripe one-time payment checkout session for an agent credit pack.
 * Uses inline price_data (no pre-created Price IDs needed).
 *
 * Body: { packId: "pack_50" | "pack_200" | "pack_500" }
 * Returns: { url: string }
 *
 * After payment, Stripe webhook fires checkout.session.completed with
 * metadata.type === "credits" and credits are added to the user's balance.
 */

import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { CREDIT_PACKS } from "@/lib/agent-credits";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to purchase credits" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { packId } = await req.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);

  if (!pack) {
    return NextResponse.json({ error: "Unknown credit pack" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dominat8.io";

  // Reuse existing Stripe customer if available
  let customerId: string | undefined;
  try {
    const stored = await kv.get<string>(`stripe:customer:${userId}`);
    if (stored) customerId = stored;
  } catch { /* continue without customer reuse */ }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: userId,
    ...(customerId ? { customer: customerId } : {}),
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pack.priceInCents,
          product_data: {
            name: `${pack.credits} Agent Credits`,
            description:
              "Use for AI analysis agents — SEO Sweep, Accessibility Checker, Design Fixer, and more. Credits never expire.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "credits",
      userId,
      credits: String(pack.credits),
      packId: pack.id,
    },
    success_url: `${appUrl}/io?credits=added&amount=${pack.credits}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/io?credits=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
