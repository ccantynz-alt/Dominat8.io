// app/lib/threadStore.ts
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { randomUUID } from "crypto";

export type ThreadMsg = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

function nowISO() {
  return typeof kvNowISO === "function" ? kvNowISO() : new Date().toISOString();
}

// Keep compatibility with multiple historical key formats,
// but always write to the PRIMARY key to stop splitting data.
function primaryMessagesKey(threadId: string) {
  return `threads:${threadId}:messages`;
}

function threadKey(threadId: string) {
  return `threads:${threadId}`;
}

function candidateMessageKeys(threadId: string) {
  return [
    `threads:${threadId}:messages`, // primary (new)
    `thread:${threadId}:messages`,
    `threads:messages:${threadId}`,
    `thread_messages:${threadId}`,
  ];
}

async function readMessages(threadId: string): Promise<{ keyUsed: string; messages: ThreadMsg[] }> {
  const keys = candidateMessageKeys(threadId);

  for (const k of keys) {
    const val = await kvJsonGet(k);
    if (Array.isArray(val)) {
      return { keyUsed: k, messages: val as ThreadMsg[] };
    }
  }

  return { keyUsed: keys[0], messages: [] };
}

async function writeMessages(threadId: string, messages: ThreadMsg[]) {
  // Always write the primary key
  await kvJsonSet(primaryMessagesKey(threadId), messages);

  // If any legacy keys already exist (and contain arrays), keep them synced too
  const keys = candidateMessageKeys(threadId);
  for (let i = 1; i < keys.length; i++) {
    const existing = await kvJsonGet(keys[i]);
    if (Array.isArray(existing)) {
      await kvJsonSet(keys[i], messages);
    }
  }
}

/** Ensure the thread object exists (minimal). */
async function ensureThreadExists(threadId: string) {
  const existing = await kvJsonGet(threadKey(threadId));
  if (existing && typeof existing === "object") return;

  const ts = nowISO();
  await kvJsonSet(threadKey(threadId), {
    id: threadId,
    createdAt: ts,
    updatedAt: ts,
  });
}

/** Read thread messages (never throws "thread not found"; returns []). */
export async function getThreadMessages(threadId: string): Promise<ThreadMsg[]> {
  await ensureThreadExists(threadId);
  const { messages } = await readMessages(threadId);
  return Array.isArray(messages) ? messages : [];
}

/** Append a message to the thread and return updated array. */
export async function appendThreadMessage(
  threadId: string,
  msg: Omit<ThreadMsg, "id" | "createdAt"> & Partial<Pick<ThreadMsg, "id" | "createdAt">>
): Promise<ThreadMsg[]> {
  await ensureThreadExists(threadId);

  const { messages } = await readMessages(threadId);

  const nextMsg: ThreadMsg = {
    id: msg.id ?? `msg_${randomUUID().replace(/-/g, "")}`,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt ?? nowISO(),
  };

  const next = [...(Array.isArray(messages) ? messages : []), nextMsg];
  await writeMessages(threadId, next);

  // bump thread updatedAt (best-effort)
  const t = await kvJsonGet<any>(threadKey(threadId));
  if (t && typeof t === "object") {
    t.updatedAt = nowISO();
    await kvJsonSet(threadKey(threadId), t);
  }

  return next;
}
