"use client";

import { useEffect, useMemo, useState } from "react";

type Site = {
  id: string;
  url: string;
  notes?: string;
  platformHint?: string;
  createdAt?: string;
};

export default function SitesPage() {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [platformHint, setPlatformHint] = useState("unknown");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Site[]>([]);
  const [err, setErr] = useState<string>("");

  async function refresh() {
    setErr("");
    const r = await fetch("/api/sites/list?ts=" + Math.floor(Date.now()/1000), { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) {
      setErr(j.error || "Failed to load");
      setItems([]);
      return;
    }
    setItems(j.sites || []);
  }

  useEffect(() => { refresh(); }, []);

  async function add() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/sites/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, notes, platformHint }),
      });
      const j = await r.json().catch(() => ({}));
      if (!j.ok) throw new Error(j.error || "Add failed");
      setUrl(""); setNotes(""); setPlatformHint("unknown");
      await refresh();
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const count = useMemo(() => items.length, [items]);

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Sites</h1>
        <div style={{ opacity: 0.75, fontSize: 12 }}>Count: {count}</div>
      </div>

      <div style={{ marginTop: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", padding: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Register external site URL (v0)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 840 }}>
          <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com"
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.14)" }} />

          <input value={platformHint} onChange={(e)=>setPlatformHint(e.target.value)} placeholder="platformHint (emergent/vercel/render/other)"
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.14)" }} />

          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="notes (optional)"
            rows={3}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.14)" }} />

          <button disabled={loading} onClick={add}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.14)", cursor: "pointer" }}>
            {loading ? "Adding..." : "Add site"}
          </button>

          {err ? (
            <div style={{ marginTop: 8, color: "crimson", fontSize: 13 }}>
              {err}
              <div style={{ marginTop: 6, color: "rgba(0,0,0,0.6)" }}>
                If this says KV is not configured: create Vercel KV (Upstash) and set KV_REST_API_URL + KV_REST_API_TOKEN.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", padding: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Registered</div>
        {items.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 13 }}>No sites yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((x) => (
              <div key={x.id} style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)" }}>
                <div style={{ fontSize: 14 }}><b>{x.url}</b></div>
                <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                  {x.platformHint ? `platform: ${x.platformHint}` : "platform: unknown"}{" "}
                  {x.createdAt ? `• ${x.createdAt}` : ""}
                </div>
                {x.notes ? <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{x.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}