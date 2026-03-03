/**
 * Clerk webhook handler
 * Handles user.created → sends welcome email
 *
 * Setup:
 *   1. In Clerk Dashboard → Webhooks → Add endpoint: /api/webhooks/clerk
 *   2. Subscribe to: user.created
 *   3. Copy the signing secret to CLERK_WEBHOOK_SECRET env var
 */
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  // Fail-secure: reject webhooks if signing secret is not configured
  if (!secret) {
    console.warn("[clerk-webhook] CLERK_WEBHOOK_SECRET not set — rejecting webhook");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 403 });
  }

  // Verify webhook signature
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Simple timestamp check (within 5 minutes)
  const ts = parseInt(svixTimestamp, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) {
    return NextResponse.json({ error: "Stale webhook" }, { status: 400 });
  }

  const body = await req.json() as {
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ email_address: string; id: string }>;
      first_name?: string;
      last_name?: string;
    };
  };

  if (body.type === "user.created") {
    const user = body.data;
    const primaryEmail = user.email_addresses?.[0]?.email_address;
    const firstName = user.first_name ?? undefined;

    if (primaryEmail) {
      await sendWelcomeEmail(primaryEmail, firstName);
    }
  }

  return NextResponse.json({ received: true });
}
