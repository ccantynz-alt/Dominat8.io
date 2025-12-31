// app/api/threads/route.ts
import { NextResponse } from "next/server";
import { createThread, listThreads } from "../../lib/memory";
import { getCurrentUserId } from "../../lib/demoAuth";

export async function GET() {
  const userId = getCurrentUserId();
  const threads = await listThreads(userId);
  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: Request) {
  const userId = getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "New chat";
  const thread = await createThread(userId, title);
  return NextResponse.json({ ok: true, thread });
}
