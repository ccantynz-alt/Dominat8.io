// app/api/debug/force-free/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET() {
  // This is here so you can visit the URL in the browser and see JSON (not HTML).
  return NextResponse.json({
    ok: true,
    route: "/api/debug/force-free",
    methods: ["GET", "POST"],
    note: "POST will set your plan to free in KV.",
  });
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const key = `plan:clerk:${userId}`;
  await kv.set(key, "free");

  return NextResponse.json({
    ok: true,
    userId,
    set: key,
    value: "free",
  });
}
