import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";

export async function POST(req: Request) {
  const { priceId, userId } = await req.json();

  if (!priceId || !userId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    metadata: { userId },
  });

  return NextResponse.json({ ok: true, url: session.url });
}
