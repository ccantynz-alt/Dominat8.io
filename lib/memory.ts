import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "./kv";
import { K } from "./keys";
import { uid } from "./id";
import type { MemoryRecord } from "./types";

export async function addMemory(input: {
  scope: MemoryRecord["scope"];
  scopeId: string;
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
