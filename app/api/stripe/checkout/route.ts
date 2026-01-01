import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUserId } from "../../../lib/demoAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const userId = getCurrentUserId();
  const body = await req.json().catch(() => ({}));

  const priceId = typeof body?.priceId === "string" ? body.priceId : "";
  const successUrl = typeof body?.successUrl === "string" ? body.successUrl : "";
  const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY in env vars" },
      { status: 500 }
    );
  }

  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing priceId, successUrl, or cancelUrl" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20"
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId
  });

  return NextResponse.json({ ok: true, url: session.url });
}
