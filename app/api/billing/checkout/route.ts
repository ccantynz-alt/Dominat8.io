import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST() {
  // IMPORTANT: in your Clerk version, auth() is async
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_PRO_PRICE_ID) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_PRO_PRICE_ID" },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_APP_URL" },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],

    // 🔑 THIS is the link between Stripe and your Clerk user
    metadata: {
      clerkUserId: userId,
    },

    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
