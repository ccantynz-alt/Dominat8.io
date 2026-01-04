import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { setUserSubscriptionActive } from "../../../../lib/billingKV";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Missing Stripe signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook signature verification failed: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const clerkUserId = session?.metadata?.clerkUserId || null;
      const customerId = session?.customer || null;
      const subscriptionId = session?.subscription || null;

      if (clerkUserId) {
        await setUserSubscriptionActive({ clerkUserId, customerId, subscriptionId });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Webhook handler error" }, { status: 500 });
  }
}
