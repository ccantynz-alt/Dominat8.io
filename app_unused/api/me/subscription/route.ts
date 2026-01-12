import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // This endpoint is intentionally stubbed.
  // Later, we will look up the user's plan/subscription from Stripe (or KV).
  return NextResponse.json({
    ok: true,
    userId,
    subscription: {
      status: "none",
      plan: "free",
    },
    note: "Stubbed subscription endpoint. Connect Stripe/KV later.",
  });
}
