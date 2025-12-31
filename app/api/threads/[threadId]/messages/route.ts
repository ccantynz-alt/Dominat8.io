// app/api/threads/[threadId]/messages/route.ts
import { NextResponse } from "next/server";
import { getMessages, getThread } from "../../../../lib/memory";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export async function GET(_: Request, { params }: { params: { threadId: string } }) {
  const userId = getCurrentUserId();
  const threadId = params.threadId;

  const t = await getThread(userId, threadId);
  if (!t) return NextResponse.json({ ok: false, error: "Thread not found" }, { status: 404 });

  const messages = await getMessages(userId, threadId);
  return NextResponse.json({ ok: true, thread: t, messages });
}
