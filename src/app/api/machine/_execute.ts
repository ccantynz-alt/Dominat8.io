import { escalate } from './_escalate';
import { dequeueSafe, recordResult } from './_queue';
/**
 * LMM-1 EXECUTOR (SAFE MODE)
 * Runs only safe, reversible, low-blast actions:
 * - warm_routes: fetch known routes to warm caches / detect transient failures
 * - recheck_guard: runGuard again after warm
 *
 * Never does:
 * - DNS changes
 * - env changes
 * - deploy/rollback
 * - code changes
 */
import type { GuardReport } from './_guard';
import { inferBaseUrl, runGuard } from './_guard';

export type SafeActionName = 'warm_routes' | 'recheck_guard';

export type SafeActionResult = {
  name: SafeActionName;
  ok: boolean;
  ms: number;
  detail?: any;
};

async function warmRoute(url: string): Promise<{ ok: boolean; status?: number }> {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    return { ok: r.status >= 200 && r.status < 500, status: r.status };
  } catch {
    return { ok: false };
  }
}

export async function executeSafe(req: Request, guard: GuardReport): Promise<{
  ran: boolean;
  base: string;
  actions: SafeActionResult[];
  guardAfter?: GuardReport | null;
}> {
  const base = inferBaseUrl();

  // Only run when degraded (safe mode)
  if (!guard.degraded) {
    return { ran: false, base, actions: [], guardAfter: null };
  }

  const actions: SafeActionResult[] = [];

  // Action 1: warm_routes (safe)
  {
    const t0 = Date.now();
    const targets = [
      '/',
      '/pricing',
      '/templates',
      '/admin',
      '/api/machine/status',
      '/api/machine/feed',
      '/api/machine/guard',
    ];
    const results: any[] = [];
    for (const p of targets) {
      const r = await warmRoute(base + p);
      results.push({ path: p, ...r });
    }
    actions.push({ name: 'warm_routes', ok: results.every((x) => x.ok), ms: Date.now() - t0, detail: results });
  }

  // Action 2: recheck_guard (safe)
  let guardAfter: GuardReport | null = null;
  {
    const t0 = Date.now();
    try {
      guardAfter = await runGuard(req.url);
      actions.push({ name: 'recheck_guard', ok: !guardAfter.degraded, ms: Date.now() - t0, detail: { degraded: guardAfter.degraded, summary: (guardAfter as any)?.classification?.summary || null } });
    } catch (e: any) {
      actions.push({ name: 'recheck_guard', ok: false, ms: Date.now() - t0, detail: String(e?.message || e) });
    }
  }

  const failed = actions.filter(a => !a.ok);
if (failed.length >= 2) {
  escalate('executor_failed_multiple_actions');
}
return { ran: true, base, actions, guardAfter };
}




