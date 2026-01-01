import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { kvJsonSet, kvNowISO } from "@/app/lib/kv";

function nowISO() {
  return kvNowISO ? kvNowISO() : new Date().toISOString();
}

function threadKey(threadId: string) {
  return `threads:${threadId}`;
}

function threadMessagesKey(threadId: string) {
  return `threads:${threadId}:messages`;
}

export async function POST() {
  // Use your existing thread id style (you currently have th_...)
  const threadId = `th_${randomUUID().replace(/-/g, "")}`;
  const createdAt = nowISO();

  // Minimal thread object (safe, extensible)
  await kvJsonSet(threadKey(threadId), {
    id: threadId,
    createdAt,
    updatedAt: createdAt,
  });

  // Initialize empty messages array
  await kvJsonSet(threadMessagesKey(threadId), []);

  return NextResponse.json({ ok: true, threadId });
}
