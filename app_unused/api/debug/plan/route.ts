// app/api/debug/plan/route.ts

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { requireAdmin } from "@/app/lib/admin-guard";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { userId } = gate;

  const planKey = `plan:clerk:${userId}`;
  const countKey = `projects:count:${userId}`;

  const plan = (await kv.get(planKey)) ?? "free";
  const projectCount = (await kv.get(countKey)) ?? 0;

  return NextResponse.json({
    ok: true,
    userId,
    plan,
    projectCount,
    planKey,
    countKey,
  });
}
