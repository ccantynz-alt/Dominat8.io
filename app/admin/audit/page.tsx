// app/admin/audit/page.tsx
"use client";

import { useEffect, useState } from "react";

type AuditEvent = {
  ts: string;
  action: string;
  ip: string;
  ua: string;
  note?: string;
};

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/audit?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load audit log");
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Admin Audit</h1>
          <p style={{ marginTop: 8, opacity: 0.75 }}>
            Security events: login attempts, lockouts, logout, status checks.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
            fontWeight: 800,
          }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
          overflowX: "auto",
        }}
      >
        {loading ? (
          <div style={{ opacity: 0.75 }}>Loading…</div>
        ) : err ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,0,0,0.25)",
              background: "rgba(255,0,0,0.08)",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        ) : events.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No events yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.8 }}>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>Time</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>Action</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>IP</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                    {e.ts}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", fontWeight: 800 }}>
                    {e.action}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                    {e.ip}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {e.note || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 14, opacity: 0.75, fontSize: 13, lineHeight: 1.6 }}>
        Tip: If you see repeated <b>admin_login_failed</b> events from the same IP, your lockout is working.
      </div>
    </div>
  );
}
