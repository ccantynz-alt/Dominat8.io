// app/lib/memory.ts
import { kvJsonGet, kvJsonSet, kvNowISO } from "./kv";

export type ChatMsg = {
  role: "system" | "user" | "assistant";
  content: string;
  at: string;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

function threadKey(userId: string, threadId: string) {
  return `threads:${userId}:${threadId}`;
}

function threadIndexKey(userId: string) {
  return `threads:index:${userId}`;
}

function messagesKey(userId: string, threadId: string) {
  return `messages:${userId}:${threadId}`;
}

export async function listThreads(userId: string): Promise<Thread[]> {
  const ids = (await kvJsonGet<string[]>(threadIndexKey(userId))) ?? [];
  const out: Thread[] = [];
  for (const id of ids) {
    const t = await kvJsonGet<Thread>(threadKey(userId, id));
    if (t) out.push(t);
  }
  // newest first
  out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return out;
}

export async function createThread(userId: string, title = "New chat"): Promise<Thread> {
  const id = `th_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = kvNowISO();
  const t: Thread = { id, title, createdAt: now, updatedAt: now };

  const index = (await kvJsonGet<string[]>(threadIndexKey(userId))) ?? [];
  await kvJsonSet(threadIndexKey(userId), [id, ...index]);
  await kvJsonSet(threadKey(userId, id), t);
  await kvJsonSet(messagesKey(userId, id), []);

  return t;
}

export async function getThread(userId: string, threadId: string): Promise<Thread | null> {
  return (await kvJsonGet<Thread>(threadKey(userId, threadId))) ?? null;
}

export async function getMessages(userId: string, threadId: string): Promise<ChatMsg[]> {
  return (await kvJsonGet<ChatMsg[]>(messagesKey(userId, threadId))) ?? [];
}

export async function appendMessage(userId: string, threadId: string, msg: Omit<ChatMsg, "at">) {
  const now = kvNowISO();
  const msgs = (await kvJsonGet<ChatMsg[]>(messagesKey(userId, threadId))) ?? [];
  msgs.push({ ...msg, at: now });
  await kvJsonSet(messagesKey(userId, threadId), msgs);

  const t = await getThread(userId, threadId);
  if (t) {
    t.updatedAt = now;
    await kvJsonSet(threadKey(userId, threadId), t);
  }
}
