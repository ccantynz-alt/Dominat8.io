"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = { id: string; name: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function readResponse(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const json = await res.json().catch(() => null);
      return { json, text: JSON.stringify(json, null, 2) };
    }
    const text = await res.text().catch(() => "");
    return { json: null, text };
  }

  async function loadProjects() {
    setError(null);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const { json, text } = await readResponse(res);

      if (!res.ok) {
        throw new Error(`GET /api/projects failed (${res.status})\n\n${text || "(empty response)"}`);
      }
      if (!json?.ok) {
        throw new Error(`GET /api/projects returned ok:false\n\n${text || "(empty response)"}`);
      }

      setProjects(json.projects || []);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const { json, text } = await readResponse(res);

      if (!res.ok) {
        throw new Error(`POST /api/projects failed (${res.status})\n\n${text || "(empty response)"}`);
      }
      if (!json?.ok) {
        throw new Error(`POST /api/projects returned ok:false\n\n${text || "(empty response)"}`);
      }

      setName("");
      await loadProjects();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #333", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Create Project</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI website builder"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #444", minWidth: 260 }}
          />

          <button
            onClick={createProject}
            disabled={busy || !name.trim()}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
          >
            {busy ? "Creating…" : "Create Project"}
          </button>

          <button
            onClick={loadProjects}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", cursor: "pointer" }}
          >
            Refresh
          </button>

          <a
            href="/api/projects"
            target="_blank"
            rel="noreferrer"
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #444", textDecoration: "none" }}
          >
            Open /api/projects
          </a>
        </div>

        {error ? (
          <pre style={{ marginTop: 12, padding: 12, background: "#111", borderRadius: 10, whiteSpace: "pre-wrap" }}>
            {error}
          </pre>
        ) : null}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Projects</h2>
        {projects.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No projects yet.</div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "underline" }}>
                  {p.name} ({p.id})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
