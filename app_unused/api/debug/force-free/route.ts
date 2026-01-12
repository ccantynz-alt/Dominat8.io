// app/api/debug/force-free/route.ts

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { requireAdmin } from "@/app/lib/admin-guard";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  return NextResponse.json({
    ok: true,
    route: "/api/debug/force-free",
    methods: ["GET", "POST"],
    note: "POST sets YOUR plan to free (admin-only).",
  });
}

export async function POST() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { userId } = gate;

  const key = `plan:clerk:${userId}`;
  await kv.set(key, "free");

  return NextResponse.json({
    ok: true,
    userId,
    set: key,
    value: "free",
  });
}
