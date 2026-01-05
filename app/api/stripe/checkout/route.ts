import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // IMPORTANT:
  // This endpoint is a placeholder unless you already wired Stripe.
  // If you already have Stripe logic elsewhere, keep that and ONLY fix auth().
  // For now we return a safe response so the build passes.

  return NextResponse.json({ ok: true });
}
