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

function dayKey(date = new Date()) {
  // YYYY-MM-DD in UTC
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function pvKey(projectId: string, day: string) {
  return `analytics:pv:${projectId}:${day}`;
}

function uvKey(projectId: string, day: string) {
  return `analytics:uv:${projectId}:${day}`;
}

function seenVisitorKey(projectId: string, day: string, visitorId: string) {
  return `analytics:seen:${projectId}:${day}:${visitorId}`;
}

function topPageKey(projectId: string, day: string, path: string) {
  // store per-day per-path pageviews
  return `analytics:top:${projectId}:${day}:${encodeURIComponent(path)}`;
}

function recentListKey(projectId: string) {
  return `analytics:recent:${projectId}`;
}

export async function recordEvent(e: AnalyticsEvent) {
  const day = dayKey(new Date(e.ts));

  // Pageviews
  await kv.incr(pvKey(e.projectId, day));

  // Unique visitors (approx): only count once per day per visitorId
  const seenKey = seenVisitorKey(e.projectId, day, e.visitorId);
  const already = await kv.get(seenKey);
  if (!already) {
    await kv.set(seenKey, 1, { ex: 60 * 60 * 48 }); // 48h TTL
    await kv.incr(uvKey(e.projectId, day));
  }

  // Top pages per day
  await kv.incr(topPageKey(e.projectId, day, e.path));

  // Recent events feed (keep last 200)
  await kv.lpush(recentListKey(e.projectId), JSON.stringify(e));
  await kv.ltrim(recentListKey(e.projectId), 0, 199);
}

export async function getDailySeries(projectId: string, days: number) {
  // returns newest->oldest; UI can reverse
  const out: { day: string; pv: number; uv: number }[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const day = dayKey(d);

    const pvRaw = await kv.get(pvKey(projectId, day));
    const uvRaw = await kv.get(uvKey(projectId, day));

    out.push({
      day,
      pv: Number(pvRaw || 0),
      uv: Number(uvRaw || 0),
    });
  }

  return out;
}

export async function getTopPages(projectId: string, days: number, limit = 10) {
  // naive scan: build list of keys for the last N days and read them
  // (KV doesn't offer prefix scan in all environments reliably)
  const now = new Date();
  const counts: Record<string, number> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const day = dayKey(d);

    // We can't list keys by prefix safely, so we approximate using recent events:
    // We'll build top pages from recent events instead (works well for MVP).
  }

  // fallback based on recent events feed
  const recent = await getRecentEvents(projectId, 200);
  for (const e of recent) {
    counts[e.path] = (counts[e.path] || 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, pv]) => ({ path, pv }));

  return sorted;
}

export async function getRecentEvents(projectId: string, limit = 50): Promise<AnalyticsEvent[]> {
  const items = await kv.lrange<string>(recentListKey(projectId), 0, Math.max(0, limit - 1));
  const events: AnalyticsEvent[] = [];

  for (const s of items || []) {
    try {
      events.push(JSON.parse(s));
    } catch {
      // ignore bad entries
    }
  }

  return events;
}
