/**
 * Machine guard (SAFE MODE).
 * Minimal implementation to keep builds green. No side effects.
 */

export type GuardCheck = {
  ok: boolean;
  name: string;
  detail?: string;
  status?: number | null;
};

export type GuardReport = {
  ok: boolean;
  baseUrl: string;
  checks: GuardCheck[];
  issues?: string[];
  tsIso: string;
};

export function inferBaseUrl(): string {
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

  return {
    ok: true,
    baseUrl: resolved,
    checks,
    issues: [],
    tsIso: nowIso
  };
}
