import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    await kv.hset(`user:${userId}`, {
      subscriptionActive: "true",
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ACTIVATE SUB ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Activation failed" },
      { status: 500 }
    );
  }
}
