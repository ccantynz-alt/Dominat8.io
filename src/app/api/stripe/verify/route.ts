/**
 * GET /api/stripe/verify?session_id=xxx
 *
 * Verifies a Stripe checkout session was actually paid.
 * Called by the frontend after redirect to prevent URL-param spoofing.
 * Returns the confirmed plan or credit amount.
 */

import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this session belongs to the requesting user
    const sessionUserId = session.client_reference_id ?? session.metadata?.userId;
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        verified: false,
        status: session.payment_status,
      });
    }

    return NextResponse.json({
      verified: true,
      plan: session.metadata?.plan ?? null,
      type: session.metadata?.type ?? "subscription",
      credits: session.metadata?.credits ? parseInt(session.metadata.credits, 10) : null,
    });
  } catch (err) {
    console.error("[stripe/verify] Error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
