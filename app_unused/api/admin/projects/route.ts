import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function isAdminUserId(userId: string | null) {
  if (!userId) return false;

  // Comma-separated list of Clerk user IDs in Vercel env:
  // ADMIN_USER_IDS=user_123,user_456
  const raw = process.env.ADMIN_USER_IDS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return list.includes(userId);
}

export async function GET(_req: Request) {
  // ✅ FIX: auth() returns a Promise in your current Clerk typings/build
  const { userId } = await auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // This endpoint is intentionally stubbed.
  // When you’re ready, we can connect Clerk’s server-side user listing API.
  return NextResponse.json({
    ok: true,
    users: [],
    note: "Stubbed admin users endpoint. Connect Clerk user listing later.",
  });
}
