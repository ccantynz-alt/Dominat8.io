import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUserId } from "@/lib/admin";

export const runtime = "nodejs";

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 20,
  pro: 100,
  agency: 500,
};

async function kvGet(key: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { result?: string | null };
    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  let userId: string | null = null;
  try {
    const session = await Promise.race([
      auth(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), 5000),
      ),
    ]);
    userId = session.userId;
  } catch {
    // Auth unavailable
  }

  if (!userId) {
    return NextResponse.json({ signedIn: false });
  }

  const isAdmin = isAdminUserId(userId);
  if (isAdmin) {
    return NextResponse.json({
      signedIn: true,
      plan: "admin",
      usage: 0,
      limit: 999999,
      remaining: 999999,
    });
  }

  const planRaw = await kvGet(`user:${userId}:plan`);
  const plan = ["starter", "pro", "agency"].includes(planRaw ?? "")
    ? planRaw!
    : "free";
  const limit = PLAN_LIMITS[plan] ?? 3;

  const month = new Date().toISOString().slice(0, 7);
  const usageKey = `usage:${userId}:${month}`;
  const usageRaw = await kvGet(usageKey);
  const usage = parseInt(usageRaw ?? "0", 10) || 0;
  const remaining = Math.max(0, limit - usage);

  return NextResponse.json({ signedIn: true, plan, usage, limit, remaining });
}
