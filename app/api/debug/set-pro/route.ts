import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = body?.token;

  if (token !== process.env.DEBUG_PRO_TOKEN) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  await kv.set(`user:${userId}:plan`, "pro");

  return NextResponse.json({
    ok: true,
    userId,
    plan: "pro",
    message: "User upgraded to Pro (debug)",
  });
}
