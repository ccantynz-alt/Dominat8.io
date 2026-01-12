// app/lib/adminSecurity.ts
import { storeGet, storeSet } from "./store";

type RateState = {
  count: number;
  windowStart: number; // ms epoch
  lockedUntil?: number; // ms epoch
};

type AuditEvent = {
  ts: string; // ISO
  action:
    | "admin_login_success"
    | "admin_login_failed"
    | "admin_login_locked"
    | "admin_logout"
    | "admin_me_check";
  ip: string;
  ua: string;
  note?: string;
};

const RL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RL_MAX_ATTEMPTS = 5; // 5 attempts per window
const RL_LOCK_MS = 30 * 60 * 1000; // 30 minutes lockout

const AUDIT_KEY = "audit:admin:events";
const AUDIT_MAX = 200;

function nowMs() {
  return Date.now();
}

export function getIpFromHeaders(headers: Headers): string {
  const xf = headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0]?.trim();
  return ip || headers.get("x-real-ip") || "unknown";
}

export function getUaFromHeaders(headers: Headers): string {
  return headers.get("user-agent") || "unknown";
}

function rlKey(ip: string) {
  return `admin:rl:${ip}`;
}

export async function checkRateLimit(ip: string): Promise<{
  ok: boolean;
  locked: boolean;
  remaining: number;
  retryAfterSec?: number;
}> {
  const k = rlKey(ip);
  const raw = await storeGet(k);
  const st: RateState | null =
    raw && typeof raw === "object" ? (raw as RateState) : null;

  const t = nowMs();

  if (st?.lockedUntil && st.lockedUntil > t) {
    const retryAfterSec = Math.ceil((st.lockedUntil - t) / 1000);
    return { ok: false, locked: true, remaining: 0, retryAfterSec };
  }

  // If no state, allow
  if (!st) {
    return { ok: true, locked: false, remaining: RL_MAX_ATTEMPTS };
  }

  // Window expired -> reset
  if (t - st.windowStart > RL_WINDOW_MS) {
    return { ok: true, locked: false, remaining: RL_MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, RL_MAX_ATTEMPTS - st.count);
  if (remaining <= 0) {
    // Already exceeded, lock now
    const lockedUntil = t + RL_LOCK_MS;
    const next: RateState = {
      count: st.count,
      windowStart: st.windowStart,
      lockedUntil,
    };
    await storeSet(k, next);
    const retryAfterSec = Math.ceil(RL_LOCK_MS / 1000);
    return { ok: false, locked: true, remaining: 0, retryAfterSec };
  }

  return { ok: true, locked: false, remaining };
}

export async function recordFailedAttempt(ip: string): Promise<{
  lockedNow: boolean;
  retryAfterSec?: number;
}> {
  const k = rlKey(ip);
  const raw = await storeGet(k);
  const st: RateState | null =
    raw && typeof raw === "object" ? (raw as RateState) : null;

  const t = nowMs();

  // If locked already, do nothing
  if (st?.lockedUntil && st.lockedUntil > t) {
    const retryAfterSec = Math.ceil((st.lockedUntil - t) / 1000);
    return { lockedNow: true, retryAfterSec };
  }

  // Start a new window if missing or expired
  let next: RateState;
  if (!st || t - st.windowStart > RL_WINDOW_MS) {
    next = { count: 1, windowStart: t };
  } else {
    next = { count: st.count + 1, windowStart: st.windowStart };
  }

  // If exceeded, lock
  if (next.count >= RL_MAX_ATTEMPTS) {
    next.lockedUntil = t + RL_LOCK_MS;
    await storeSet(k, next);
    return { lockedNow: true, retryAfterSec: Math.ceil(RL_LOCK_MS / 1000) };
  }

  await storeSet(k, next);
  return { lockedNow: false };
}

export async function clearRateLimit(ip: string) {
  // Reset on successful login to be nice
  const k = rlKey(ip);
  await storeSet(k, { count: 0, windowStart: nowMs() });
}

export async function audit(
  evt: Omit<AuditEvent, "ts"> & { ts?: string }
) {
  const e: AuditEvent = {
    ts: evt.ts || new Date().toISOString(),
    action: evt.action,
    ip: evt.ip,
    ua: evt.ua,
    note: evt.note,
  };

  const existing = await storeGet(AUDIT_KEY);
  const arr: AuditEvent[] = Array.isArray(existing) ? (existing as any) : [];
  arr.unshift(e);
  const trimmed = arr.slice(0, AUDIT_MAX);
  await storeSet(AUDIT_KEY, trimmed);
}

export async function getAuditEvents(limit = 50): Promise<AuditEvent[]> {
  const existing = await storeGet(AUDIT_KEY);
  const arr: AuditEvent[] = Array.isArray(existing) ? (existing as any) : [];
  return arr.slice(0, Math.max(1, Math.min(200, limit)));
}
