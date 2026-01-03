"use client";

import { useEffect, useState } from "react";

type GeneratedFile = {
  path: string;
  content?: string;
  updatedAt?: string;
};

export default function GeneratedPage() {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selected, setSelected] = useState<GeneratedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setMsg(null);

        // If you already have an endpoint for generated files, it can plug in here later.
        // For now, we try a best-effort API call, but keep the page useful even if it fails.
        const res = await fetch("/api/generated", { cache: "no-store" });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.files) ? data.files : Array.isArray(data) ? data : [];
          if (!cancelled) {
            setFiles(list);
            setSelected(list[0] || null);
          }
        } else {
          // Fallback: show example files so the UI looks finished
          const demo: GeneratedFile[] = [
            {
              path: "app/generated/page.tsx",
              updatedAt: new Date().toISOString(),
              content:
                "// Demo file\n// Once your AI runs generate real files, they will appear here.\n",
            },
            {
              path: "README.generated.md",
              updatedAt: new Date().toISOString(),
              content:
                "# Generated Output\n\nThis page shows generated files.\n\nWhen your run pipeline is wired, you can load real output from KV or a database.\n",
            },
          ];
          if (!cancelled) {
            setFiles(demo);
            setSelected(demo[0]);
            setMsg("Generated API not available yet — showing demo output.");
          }
        }
      } catch (e: any) {
        const demo: GeneratedFile[] = [
          {
            path: "README.generated.md",
            updatedAt: new Date().toISOString(),
            content:
              "# Generated Output\n\nThis is demo output.\n\nWire your /api/generated endpoint to display real files later.\n",
          },
        ];
        if (!cancelled) {
          setFiles(demo);
          setSelected(demo[0]);
          setMsg(e?.message || "Could not load generated files — showing demo output.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Generated</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            View the files produced by your AI runs. (This page will show real output once the backend is wired.)
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/" style={linkStyle}>Home</a>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      {loading && <div style={panelStyle}>Loading…</div>}

      {msg && (
        <div style={{ ...panelStyle, borderColor: "#f3e2a6", background: "#fffdf2" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, marginTop: 18 }}>
        <aside style={panelStyle}>
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Files</h2>

          {files.length === 0 ? (
            <div style={{ color: "#666" }}>No generated files yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {files.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setSelected(f)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #eee",
                    background: selected?.path === f.path ? "#111" : "#fff",
                    color: selected?.path === f.path ? "#fff" : "#111",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{f.path}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {f.updatedAt ? new Date(f.updatedAt).toLocaleString() : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section style={panelStyle}>
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Preview</h2>

          {!selected ? (
            <div style={{ color: "#666" }}>Select a file to preview.</div>
          ) : (
            <pre
              style={{
                marginTop: 10,
                padding: 14,
                background: "#f7f7f7",
                borderRadius: 12,
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
                fontSize: 13,
              }}
            >
              {selected.content || "// No content"}
            </pre>
          )}

          <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
            Next step: wire <code>/api/generated</code> to return your real generated files.
          </div>
        </section>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};
