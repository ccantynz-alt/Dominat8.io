import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "./kv";
import { K } from "./keys";
import { uid } from "./id";
import type { MemoryRecord } from "./types";

/**
 * Add a memory record (used by agents, runs, auto-updates, etc)
 */
export async function addMemory(input: {
  scope: MemoryRecord["scope"]; // "project" | "user"
  scopeId: string;              // projectId or userId
  content: string;
  tags?: string[];
}): Promise<MemoryRecord> {
  const id = uid("mem");
  const createdAt = await kvNowISO();

  const rec: MemoryRecord = {
    id,
    scope: input.scope,
    scopeId: input.scopeId,
    createdAt,
    content: input.content,
    tags: input.tags ?? [],
  };

  // 1) Store the memory object
  await kvJsonSet(K.memory(id), rec);

  // 2) Add to index for fast lookup (newest first)
  await kv.zadd(K.memoryIndex(input.scope, input.scopeId), {
    score: Date.now(),
    member: id,
  });

  return rec;
}

/**
 * List recent memory records for a scope
 */
export async function listMemory(params: {
  scope: MemoryRecord["scope"];
  scopeId: string;
  limit?: number;
}): Promise<MemoryRecord[]> {
  const limit = params.limit ?? 20;

  const ids = await kv.zrange<string[]>(
    K.memoryIndex(params.scope, params.scopeId),
    0,
    limit - 1,
    { rev: true }
  );

  const out: MemoryRecord[] = [];
  for (const id of ids) {
    const rec = await kvJsonGet<MemoryRecord>(K.memory(id));
    if (rec) out.push(rec);
  }

  return out;
}

/**
 * Read a single memory record
 */
export async function getMemory(id: string): Promise<MemoryRecord | null> {
  return kvJsonGet<MemoryRecord>(K.memory(id));
}
