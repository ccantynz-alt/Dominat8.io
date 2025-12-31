// app/lib/threadStore.ts
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

function messagesKey(threadId: string) {
  return `thread:${threadId}:messages`;
}

export async function getThreadMessages(threadId: string): Promise<ThreadMessage[]> {
  const msgs = await kvJsonGet<ThreadMessage[]>(messagesKey(threadId));
  return Array.isArray(msgs) ? msgs : [];
}

export async function appendThreadMessage(
  threadId: string,
  msg: Omit<ThreadMessage, "id" | "createdAt">
) {
  const messages = await getThreadMessages(threadId);
  messages.push({
    id: `m_${Math.random().toString(16).slice(2)}`,
    role: msg.role,
    content: msg.content,
    createdAt: kvNowISO ? kvNowISO() : new Date().toISOString(),
  });
  await kvJsonSet(messagesKey(threadId), messages);
}
