"use client";

import { useEffect, useState } from "react";

type Project = { id: string; name: string; createdAt?: string };
type Template = { id: string; name: string; description: string; published?: boolean };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setMsg(null);

        // Projects (if API exists)
        const pr = await fetch("/api/projects", { cache: "no-store" });
        if (pr.ok) {
          const pj = await pr.json();
          const list = Array.isArray(pj?.projects) ? pj.projects : Array.isArray(pj) ? pj : [];
          if (!cancelled) setProjects(list);
        }

        // Templates (if API exists)
        const tr = await fetch("/api/templates", { cache: "no-store" });
        if (tr.ok) {
          const tj = await tr.json();
          const list = Array.isArray(tj?.templates) ? tj.templates : Array.isArray(tj) ? tj : [];
          if (!cancelled) setTemplates(list);
        }
      } catch (e: any) {
        if (!cancelled) setMsg(e?.message || "Could not load dashboard data.");
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
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Dashboard</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            Your control centre: projects, templates, and what to do next.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/" style={linkStyle}>Home</a>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/admin" style={linkStyle}>Admin</a>
        </div>
      </div>

      {loading && <div style={panelStyle}>Loading…</div>}
      {msg && (
        <div style={{ ...panelStyle, borderColor: "#f3c2c2", background: "#fff7f7", color: "#8a1f1f" }}>
          {msg}
          <div style={{ marginTop: 8, color: "#555" }}>
            This is OK if your APIs aren’t wired yet — the dashboard still works.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginTop: 18 }}>
        <div style={panelStyle}>
          <h2 style={h2Style}>Quick actions</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <a href="/templates" style={primaryAction}>Create a project from a template</a>
            <a href="/projects" style={secondaryAction}>View your projects</a>
            <a href="/generated" style={secondaryAction}>View generated output</a>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={h2Style}>Projects</h2>
          {projects.length === 0 ? (
            <div style={{ color: "#666" }}>
              No projects loaded yet.
              <div style={{ marginTop: 10 }}>
                <a href="/templates" style={secondaryAction}>Make your first project</a>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {projects.slice(0, 5).map((p) => (
                <a key={p.id} href={`/projects/${p.id}`} style={itemCard}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>
                    <code>{p.id}</code>
                    {p.createdAt ? ` • ${new Date(p.createdAt).toLocaleString()}` : ""}
                  </div>
                </a>
              ))}
              {projects.length > 5 && (
                <a href="/projects" style={linkStyle}>See all projects →</a>
              )}
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <h2 style={h2Style}>Templates</h2>
          {templates.length === 0 ? (
            <div style={{ color: "#666" }}>
              Templates API not loaded (or not published yet).
              <div style={{ marginTop: 10 }}>
                <a href="/templates" style={secondaryAction}>Browse templates</a>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {templates
                .filter((t) => t?.published !== false)
                .slice(0, 5)
                .map((t) => (
                  <div key={t.id} style={itemCard}>
                    <div style={{ fontWeight: 700 }}>{t.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{t.description}</div>
                  </div>
                ))}
              <a href="/templates" style={linkStyle}>See all templates →</a>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 22, color: "#666", fontSize: 13 }}>
        Next we’ll wire the “Use Template” button to always create a project + run automatically (if your APIs are present).
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

const h2Style: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: "1.1rem",
};

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const primaryAction: React.CSSProperties = {
  display: "block",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
};

const secondaryAction: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  textDecoration: "none",
};

const itemCard: React.CSSProperties = {
  display: "block",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #eee",
  background: "#fff",
  textDecoration: "none",
  color: "#111",
};
