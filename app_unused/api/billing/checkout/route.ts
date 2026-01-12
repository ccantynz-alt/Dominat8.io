import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!appUrl) {
    return NextResponse.json({ ok: false, error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });
  }
  if (!priceId) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  let returnTo = "/projects";
  try {
    const body: any = await req.json();
    if (typeof body?.returnTo === "string" && body.returnTo.startsWith("/")) {
      returnTo = body.returnTo;
    }
  } catch {
    // ignore
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}${returnTo}?upgraded=1`,
      cancel_url: `${appUrl}${returnTo}?canceled=1`,
      metadata: {
        clerkUserId: userId,
      },
    });

    return NextResponse.json({ ok: true, url: checkout.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
