/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   Marketing Machine event ledger (Upstash list mm:events).
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/
import { kvGet, kvLpush, kvLrange, kvSet } from "./kv";

export type MmEvent = {
  id: string;
  at: string;
  level: "info" | "warn" | "error";
  type: string;
  msg: string;
  meta?: Record<string, any>;
};

const EVENTS_KEY = "mm:events";
const LAST_RUN_KEY = "mm:lastRun";

function uid() {
  return "mm_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export async function mmAppend(e: Omit<MmEvent, "id" | "at"> & { at?: string; id?: string }) {
  const evt: MmEvent = {
    id: e.id || uid(),
    at: e.at || new Date().toISOString(),
    level: e.level,
    type: e.type,
    msg: e.msg,
    meta: e.meta || {},
  };
  const r = await kvLpush(EVENTS_KEY, evt);
  return { ok: r.ok, event: evt, kv: r };
}

export async function mmList(limit: number) {
  const n = Math.max(1, Math.min(200, limit || 50));
  return kvLrange<MmEvent>(EVENTS_KEY, 0, n - 1);
}

export async function mmSetLastRun(summary: any) {
  return kvSet(LAST_RUN_KEY, summary);
}

export async function mmGetLastRun<T = any>() {
  const r = await kvGet<string>(LAST_RUN_KEY);
  if (!r.ok) return r as any;
  const raw = r.value;
  if (!raw) return { ok: true, value: null as any };
  if (typeof raw === "string") { try { return { ok: true, value: JSON.parse(raw) as T }; } catch { return { ok: true, value: raw as any }; } }
  return { ok: true, value: raw as any };
}