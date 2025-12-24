import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  await kv.set("hello", "world");
  const v = await kv.get("hello");
  return NextResponse.json({ ok: true, value: v });
}
