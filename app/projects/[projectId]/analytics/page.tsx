"use client";

import { useEffect, useMemo, useState } from "react";

type SeriesPoint = { day: string; pv: number; uv: number };
type TopPage = { path: string; pv: number };
type RecentEvent = {
  ts: string;
  path: string;
  ref?: string;
  country?: string;
  visitorId: string;
};

export default function AnalyticsPage({ params }: { params: { projectId: string } }) {
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/projects/${params.projectId}/analytics/summary`, {
      cache: "no-store",
    });
    const data = await res.json();

    setSeries((data.series || []).slice().reverse()); // oldest->newest for display
    setTopPages(data.topPages || []);
    setRecent(data.recent || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const pv = series.reduce((a, b) => a + (b.pv || 0), 0);
    const uv = series.reduce((a, b) => a + (b.uv || 0), 0);
    return { pv, uv };
  }, [series]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Analytics</h1>

      <button onClick={load} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>

      <div style={{ marginTop: 16 }}>
        <strong>Last 14 days:</strong>
        <div>Pageviews: {totals.pv}</div>
        <div>Unique visitors: {totals.uv}</div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Daily</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Day</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>PV</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>UV</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.day}>
                <td style={{ padding: "6px 0" }}>{s.day}</td>
                <td>{s.pv}</td>
                <td>{s.uv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Top pages (from recent traffic)</h2>
        {topPages.length === 0 ? (
          <p>No traffic yet.</p>
        ) : (
          <ol>
            {topPages.map((p) => (
              <li key={p.path}>
                <code>{p.path}</code> — {p.pv}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Recent events</h2>
        {recent.length === 0 ? (
          <p>No recent events yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {recent.map((e) => (
              <div key={e.ts + e.visitorId + e.path} style={{ border: "1px solid #ddd", padding: 8 }}>
                <div><strong>{new Date(e.ts).toLocaleString()}</strong></div>
                <div>Path: <code>{e.path}</code></div>
                {e.country ? <div>Country: {e.country}</div> : null}
                {e.ref ? <div>Ref: <code>{e.ref}</code></div> : null}
                <div>Visitor: <code>{e.visitorId}</code></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
