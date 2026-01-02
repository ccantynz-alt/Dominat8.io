// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "on" | "off";

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>("on");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setOkMsg(null);
    try {
      const res = await fetch("/api/public-mode", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load public mode");
      setMode(data.mode === "off" ? "off" : "on");
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function save(nextMode: Mode) {
    setSaving(true);
    setErr(null);
    setOkMsg(null);
    try {
      const res = await fetch("/api/public-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save");
      setMode(data.mode === "off" ? "off" : "on");
      setOkMsg(`Saved: Public Mode is now ${data.mode.toUpperCase()}`);
      // If turning public mode ON, the admin routes will redirect for non-admins,
      // but you are admin so you can stay here.
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const badge =
    mode === "on"
      ? { text: "PUBLIC MODE: ON", hint: "Visitors see only the published site. Admin routes are blocked." }
      : { text: "PUBLIC MODE: OFF", hint: "Builder mode. Admin UI is visible (to everyone unless you add auth later)." };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <p style={{ marginTop: 6, opacity: 0.75 }}>
          Control platform settings. This page adds a safe toggle for Public Mode.
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
          maxWidth: 760,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>{badge.text}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{badge.hint}</div>
          </div>

          <button
            onClick={load}
            disabled={loading || saving}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              cursor: loading || saving ? "not-allowed" : "pointer",
              opacity: loading || saving ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => save("on")}
            disabled={saving || loading || mode === "on"}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: mode === "on" ? "rgba(255,255,255,0.08)" : "transparent",
              cursor: saving || loading || mode === "on" ? "not-allowed" : "pointer",
              opacity: saving || loading ? 0.6 : 1,
              fontWeight: 700,
            }}
          >
            Set Public Mode ON
          </button>

          <button
            onClick={() => save("off")}
            disabled={saving || loading || mode === "off"}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: mode === "off" ? "rgba(255,255,255,0.08)" : "transparent",
              cursor: saving || loading || mode === "off" ? "not-allowed" : "pointer",
              opacity: saving || loading ? 0.6 : 1,
              fontWeight: 700,
            }}
          >
            Set Public Mode OFF
          </button>
        </div>

        {(err || okMsg) && (
          <div style={{ marginTop: 14 }}>
            {err && (
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
            )}
            {okMsg && (
              <div
                style={{
                  marginTop: err ? 10 : 0,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,255,0,0.18)",
                  background: "rgba(0,255,0,0.07)",
                  fontSize: 13,
                }}
              >
                {okMsg}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, maxWidth: 760, opacity: 0.8, fontSize: 13, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Notes</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            Public Mode <b>ON</b>: hides admin nav + blocks admin routes for non-admin users.
          </li>
          <li>
            Public Mode <b>OFF</b>: builder mode (admin nav shown).
          </li>
          <li>
            Current “admin” definition is your existing <code>getCurrentUserId()</code>. Later we can upgrade to Clerk
            roles.
          </li>
        </ul>
      </div>
    </div>
  );
}
