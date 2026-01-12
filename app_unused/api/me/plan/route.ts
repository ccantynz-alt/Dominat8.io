import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPlan } from "@/app/lib/billingKV";

export async function GET() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: true, signedIn: false, plan: "free" });
  }

  const plan = await getPlan(userId);

  return NextResponse.json({
    ok: true,
    signedIn: true,
    userId,
    plan,
  });
}
