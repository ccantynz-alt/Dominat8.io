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

  function loadFromLocalStorage(): Project[] {
    const list: Project[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("project:")) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const p = JSON.parse(raw);
        if (p?.id && p?.name) list.push(p);
      }
    } catch {
      // ignore
    }

    return list;
  }

  async function loadProjects() {
    setLoading(true);

    let apiProjects: Project[] = [];

    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.projects)) {
          apiProjects = data.projects;
        }
      }
    } catch {
      // ignore API failure
    }

    const localProjects = loadFromLocalStorage();

    // Merge (API wins if duplicate IDs)
    const map = new Map<string, Project>();
    for (const p of localProjects) map.set(p.id, p);
    for (const p of apiProjects) map.set(p.id, p);

    setProjects(Array.from(map.values()));
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Projects</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            Your projects (API + local fallback).
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={loadProjects} style={buttonStyle}>Refresh</button>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading…</p>}

      {!loading && projects.length === 0 && (
        <div style={{ marginTop: 20, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          No projects yet. Go to <a href="/templates">Templates</a>.
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {projects.map((p) => (
          <a key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>

              {p.templateName && (
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  Template: <b>{p.templateName}</b>
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                {p.id}
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
  padding: "0.6rem 1rem",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1.1rem",
  background: "#fff",
};
