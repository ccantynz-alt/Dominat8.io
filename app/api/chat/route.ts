// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { appendMessage, getMessages, getThread, createThread } from "../../lib/memory";
import { getCurrentUserId } from "../../lib/demoAuth";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const userId = await getCurrentUserId(); // ✅ FIX: await
  const body = await req.json().catch(() => null);

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  let threadId = typeof body?.threadId === "string" ? body.threadId.trim() : "";

  if (!message) {
    return NextResponse.json({ ok: false, error: "Missing message" }, { status: 400 });
  }

  // Ensure thread exists
  const existing = threadId ? await getThread(userId, threadId) : null;
  if (!threadId || !existing) {
    const t = await createThread(userId, message.slice(0, 40) || "New chat");
    threadId = t.id;
  }

  await appendMessage(userId, threadId, { role: "user", content: message });

  const history = await getMessages(userId, threadId);

  const system = `You are a helpful assistant inside an AI agent platform.
Be concise, practical, and action-oriented.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.4,
  });

  const reply = completion.choices?.[0]?.message?.content?.trim() || "…";

  await appendMessage(userId, threadId, { role: "assistant", content: reply });

  const messages = await getMessages(userId, threadId);

  return NextResponse.json({ ok: true, threadId, reply, messages });
}
