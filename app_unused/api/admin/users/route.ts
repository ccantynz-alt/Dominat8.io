import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function isAdminUserId(userId: string | null) {
  if (!userId) return false;

  const raw = process.env.ADMIN_USER_IDS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return list.includes(userId);
}

export async function GET(_req: Request) {
  // ✅ IMPORTANT: auth() must be awaited
  const { userId } = await auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    users: [],
    note: "Stubbed admin users endpoint. Connect Clerk user listing later.",
  });
}

