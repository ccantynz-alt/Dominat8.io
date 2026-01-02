// app/sites/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function SitesIndexPage() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/public-sites?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load public sites");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
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
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>Sites</h1>
      <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
        Publicly published projects.
      </p>

      <div
        style={{
          marginTop: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
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
        ) : projects.length === 0 ? (
          <div style={{ opacity: 0.75, lineHeight: 1.6 }}>
            No public projects yet.
            <br />
            To publish one: go to <b>/projects/&lt;id&gt;/settings</b> → click <b>Make Public</b>.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {projects.map((id) => (
              <a
                key={id}
                href={`/site/${id}`}
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{id}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    /site/{id}
                  </div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>View →</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
