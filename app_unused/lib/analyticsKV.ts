/**
 * TEMP STUB:
 * Provide the exports other files expect, so builds don't warn/fail.
 */

export async function trackEvent(_event: any) {
  return { ok: true, status: "stub" };
}

export async function getDailySeries(_projectId: string) {
  return { ok: true, status: "stub", series: [] as Array<{ day: string; count: number }> };
}

export async function getTopPages(_projectId: string) {
  return { ok: true, status: "stub", pages: [] as Array<{ path: string; count: number }> };
}

export async function getRecentEvents(_projectId: string) {
  return { ok: true, status: "stub", events: [] as any[] };
}
