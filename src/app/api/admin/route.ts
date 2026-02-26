/**
 * POST /api/admin
 * Admin-only endpoint for user management.
 *
 * Body:
 *   { action: "getBalance", targetUserId: string }
 *   { action: "addCredits", targetUserId: string, amount: number }
 *   { action: "setPlan",    targetUserId: string, plan: string }
 *
 * Auth: Clerk userId must appear in ADMIN_USER_IDS env var.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { isAdminUser, getAgentBalance, addPurchasedCredits } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: string; targetUserId?: string; amount?: number; plan?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, targetUserId, amount, plan } = body;

  if (!targetUserId?.trim()) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  const tid = targetUserId.trim();

  switch (action) {
    case "getBalance": {
      const balance = await getAgentBalance(tid);
      const planRaw = await kv.get<string>(`user:${tid}:plan`);
      return NextResponse.json({ ok: true, balance, planRaw });
    }

    case "addCredits": {
      if (!amount || amount <= 0 || amount > 10000) {
        return NextResponse.json({ error: "amount must be 1–10000" }, { status: 400 });
      }
      await addPurchasedCredits(tid, Math.round(amount));
      const balance = await getAgentBalance(tid);
      return NextResponse.json({ ok: true, balance });
    }

    case "setPlan": {
      const validPlans = ["free", "starter", "pro", "agency"];
      if (!plan || !validPlans.includes(plan)) {
        return NextResponse.json({ error: `plan must be one of: ${validPlans.join(", ")}` }, { status: 400 });
      }
      await kv.set(`user:${tid}:plan`, plan);
      const balance = await getAgentBalance(tid);
      return NextResponse.json({ ok: true, balance });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
