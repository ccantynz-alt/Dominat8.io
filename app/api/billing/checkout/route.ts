import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // This endpoint is intentionally stubbed.
  // When you are ready, we will create a Stripe Checkout Session here.
  // For now, returning a safe placeholder response keeps builds GREEN.
  return NextResponse.json({
    ok: true,
    userId,
    note: "Billing checkout endpoint is stubbed. Connect Stripe Checkout later.",
  });
}
