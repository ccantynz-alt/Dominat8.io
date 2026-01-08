import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

function getBaseUrl(req: Request) {
  // Works on Vercel + local
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (!host) return 'http://localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_PRO;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
      return NextResponse.json({ ok: false, error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    }
    if (!priceId) {
      return NextResponse.json({ ok: false, error: 'Missing STRIPE_PRICE_PRO' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2024-06-20',
    });

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // IMPORTANT: tie Stripe activity to the Clerk user
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
      },

      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Checkout error' },
      { status: 500 }
    );
  }
}
