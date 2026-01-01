import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { z } from "zod";

type Msg = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

function nowISO() {
  return typeof kvNowISO === "function" ? kvNowISO() : new Date().toISOString();
}

// We don't know which exact KV key format your older code used,
// so we support multiple possibilities and pick the first one that exists.
function candidateMessageKeys(threadId: string) {
  return [
    `threads:${threadId}:messages`,     // our newer convention
    `thread:${threadId}:messages`,      // common alternative
    `threads:messages:${threadId}`,     // another common alternative
    `thread_messages:${threadId}`,      // fallback
  ];
}

async function readMessages(threadId: string): Promise<{ keyUsed: string; messages: Msg[] }> {
  const keys = candidateMessageKeys(threadId);

  for (const k of keys) {
    const val = await kvJsonGet(k);
    if (Array.isArray(val)) {
      return { keyUsed: k, messages: val as Msg[] };
    }
  }

  // If nothing exists, default to the primary key with empty array.
  return { keyUsed: keys[0], messages: [] };
}

async function writeMessagesAll(threadId: string, messages: Msg[]) {
  // Write to primary key, and also to any other key that already exists (to avoid splitting data).
  const keys = candidateMessageKeys(threadId);

  // Always write primary
  await kvJsonSet(keys[0], messages);

  // If other keys exist, keep them in sync too
  for (let i = 1; i < keys.length; i++) {
    const existing = await kvJsonGet(keys[i]);
    if (Array.isArray(existing)) {
      await kvJsonSet(keys[i], messages);
    }
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;

  try {
    const { messages } = await readMessages(threadId);

    // IMPORTANT: Never hard-fail "Thread not found" — return empty list instead.
    // This prevents UI from showing "Thread not found" while the thread still works.
    return NextResponse.json({ ok: true, messages });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to load messages" },
      { status: 500 }
    );
  }
}

const PostSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;

  const body = await req.json().catch(() => ({}));
  const parsed = PostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { messages } = await readMessages(threadId);

    const msg: Msg = {
      role: parsed.data.role,
      content: parsed.data.content,
      createdAt: nowISO(),
    };

    const next = [...messages, msg];
    await writeMessagesAll(threadId, next);

    return NextResponse.json({ ok: true, messages: next });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to append message" },
      { status: 500 }
    );
  }
}
