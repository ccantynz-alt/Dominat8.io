import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

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

export async function GET() {
  // ✅ FIX: auth() returns a Promise in your current Clerk typings/build
  const { userId } = await auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // NOTE: This endpoint is intentionally conservative and "best-effort".
  // Your KV schema may evolve. This returns whatever exists under a known list key,
  // and falls back to an empty array if not present.
  const indexKey = "projects:index";

  try {
    const ids = (await kv.get<string[]>(indexKey)) || [];
    return NextResponse.json({ ok: true, ids });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load projects" },
      { status: 500 }
    );
  }
}
