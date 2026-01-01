import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
});

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const priceId = typeof body?.priceId === "string" ? body.priceId : "";

  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "Missing priceId" },
      { status: 400 }
    );
  }

  const userId = await getCurrentUserId();

  const origin =
    req.headers.get("x-forwarded-proto") && req.headers.get("host")
      ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
      : "http://localhost:3000";

  const successUrl = `${origin}/dashboard?checkout=success`;
  const cancelUrl = `${origin}/pricing?checkout=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: { userId }
  });

  return NextResponse.json({ ok: true, url: session.url });
}
