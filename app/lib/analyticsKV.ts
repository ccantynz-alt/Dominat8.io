import { kv } from "@/app/lib/kv";

export type AnalyticsEvent = {
  ts: string; // ISO
  projectId: string;
  path: string;
  ref?: string;
  ua?: string;
  country?: string;
  visitorId: string;
};

type DayTotals = {
  pv: number;
  uv: number;
  // track visitors seen today (approx; capped)
  seen: Record<string, 1>;
  // per-path pageviews today
  pages: Record<string, number>;
};

function dayKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function totalsKey(projectId: string, day: string) {
  return `analytics:totals:${projectId}:${day}`;
}

function recentKey(projectId: string) {
  return `analytics:recent:${projectId}`;
}

const MAX_SEEN_PER_DAY = 5000; // cap memory per day per project
const MAX_RECENT = 200;

async function getDayTotals(projectId: string, day: string): Promise<DayTotals> {
  const existing = (await kv.get(totalsKey(projectId, day))) as DayTotals | null;
  if (existing) return existing;

  return { pv: 0, uv: 0, seen: {}, pages: {} };
}

async function setDayTotals(projectId: string, day: string, data: DayTotals) {
  await kv.set(totalsKey(projectId, day), data);
}

async function getRecent(projectId: string): Promise<AnalyticsEvent[]> {
  const existing = (await kv.get(recentKey(projectId))) as AnalyticsEvent[] | null;
  return existing || [];
}

async function setRecent(projectId: string, events: AnalyticsEvent[]) {
  await kv.set(recentKey(projectId), events);
}

export async function recordEvent(e: AnalyticsEvent) {
  const day = dayKey(new Date(e.ts));

  const totals = await getDayTotals(e.projectId, day);

  // PV
  totals.pv += 1;

  // UV (best-effort)
  if (Object.keys(totals.seen).length < MAX_SEEN_PER_DAY) {
    if (!totals.seen[e.visitorId]) {
      totals.seen[e.visitorId] = 1;
      totals.uv += 1;
    }
  }

  // per-page PV
  totals.pages[e.path] = (totals.pages[e.path] || 0) + 1;

  await setDayTotals(e.projectId, day, totals);

  // recent feed
  const recent = await getRecent(e.projectId);
  recent.unshift(e);
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;
  await setRecent(e.projectId, recent);
}

export async function getDailySeries(projectId: string, days: number) {
  const out: { day: string; pv: number; uv: number }[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const day = dayKey(d);

    const totals = await getDayTotals(projectId, day);

    out.push({
      day,
      pv: totals.pv || 0,
      uv: totals.uv || 0,
    });
  }

  return out; // newest -> oldest
}

export async function getRecentEvents(projectId: string, limit = 50): Promise<AnalyticsEvent[]> {
  const recent = await getRecent(projectId);
  return recent.slice(0, limit);
}

export async function getTopPages(projectId: string, days: number, limit = 10) {
  const now = new Date();
  const counts: Record<string, number> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const day = dayKey(d);

    const totals = await getDayTotals(projectId, day);
    for (const [path, pv] of Object.entries(totals.pages || {})) {
      counts[path] = (counts[path] || 0) + (pv || 0);
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, pv]) => ({ path, pv }));
}
