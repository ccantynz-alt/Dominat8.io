"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  createdAt?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadProjects() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load projects (HTTP ${res.status})`);
      const data = await res.json();

      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Projects</h1>
          <p style={{ marginTop: 10, color: "#555" }}>Your saved projects (from the API).</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/templates" style={linkStyle}>
            Templates
          </a>
          <a href="/dashboard" style={linkStyle}>
            Dashboard
          </a>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={loadProjects} style={buttonStyle}>
          Refresh
        </button>
      </div>

      {loading && <p style={{ marginTop: 18, color: "#555" }}>Loading…</p>}

      {err && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            border: "1px solid #ffb4b4",
            background: "#ffecec",
            borderRadius: 10,
            color: "#6b0000",
            fontSize: 14,
          }}
        >
          Error: {err}
        </div>
      )}

      {!loading && !err && projects.length === 0 && (
        <div style={{ marginTop: 18, padding: 14, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 600 }}>No projects yet</div>
          <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>
            Go to <a href="/templates">/templates</a> and click “Use Template”.
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {projects.map((p) => (
          <a key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>

              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                ID: <code>{p.id}</code>
              </div>

              {p.templateName && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  Template: <b>{p.templateName}</b>
                </div>
              )}

              {p.createdAt && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                  Created: {new Date(p.createdAt).toLocaleString()}
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 13, textDecoration: "underline" }}>
                Open →
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "0.6rem 0.9rem",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1.1rem",
  background: "#fff",
};
