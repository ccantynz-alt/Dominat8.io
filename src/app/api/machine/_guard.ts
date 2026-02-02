/**
 * Machine guard (SAFE MODE).
 * Minimal implementation to keep builds green. No side effects / no network calls.
 */

export type GuardCheck = {
  ok: boolean;
  name: string;
  detail?: string;
  status?: number | null;
};

export type GuardReport = {
  ok: boolean;
  degraded: boolean;
  baseUrl: string;
  checks: GuardCheck[];
  issues?: string[];
  tsIso: string;
};

// "request-like" shape used by Next handlers (kept intentionally loose)
export type RequestLike = {
  headers?: any;
  url?: string;
  nextUrl?: { origin?: string; href?: string };
};

export function inferBaseUrl(req?: RequestLike): string {
  // 1) Next Request sometimes exposes nextUrl.origin
  try {
    const origin = (req as any)?.nextUrl?.origin;
    if (typeof origin === 'string' && origin.length > 0) return origin;
  } catch {}

  // 2) If req.url is absolute, derive origin
  try {
    const u = (req as any)?.url;
    if (typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))) {
      return new URL(u).origin;
    }
  } catch {}

  // 3) Env fallbacks
  const v =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    process.env.VERCEL_URL ||
    '';

  if(!v) return '';
  if(v.startsWith('http://') || v.startsWith('https://')) return v;
  return 'https://' + v;
}

export async function runGuard(baseUrl?: string): Promise<GuardReport> {
  const resolved = (typeof baseUrl === 'string') ? baseUrl : inferBaseUrl();
  const nowIso = new Date().toISOString();

  const checks: GuardCheck[] = [
    { ok: true, name: 'guard:stub', detail: 'safe-mode (no network)', status: null }
  ];

  // SAFE MODE: never degraded, never blocks
  return {
    ok: true,
    degraded: false,
    baseUrl: resolved,
    checks,
    issues: [],
    tsIso: nowIso
  };
}
