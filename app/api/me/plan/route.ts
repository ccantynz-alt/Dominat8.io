import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/app/lib/plan";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: true, signedIn: false, plan: "free" });
  }

  const plan = await getUserPlan(userId);
  return NextResponse.json({ ok: true, signedIn: true, userId, plan });
}
