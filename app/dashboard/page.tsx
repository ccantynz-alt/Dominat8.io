"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data?.projects) ? data.projects : [];
      setProjects(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    setError("");

    try {
      // Your API supports form submissions, so we send x-www-form-urlencoded
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: trimmed }),
      });

      const data = await res.json().catch(() => null);

      const projectId =
        data?.project?.id ||
        data?.id ||
        data?.projectId ||
        data?.project?.projectId;

      if (projectId) {
        // Go straight to the project page
        window.location.href = `/dashboard/projects/${projectId}`;
        return;
      }

      // If API returned ok but no id parsed, just refresh list
      setName("");
      await loadProjects();
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        Dashboard
      </h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Create a Project
        </h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            style={{
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
              minWidth: 260,
            }}
            autoComplete="off"
          />
          <button
            onClick={createProject}
            disabled={creating}
            style={{
              padding: "10px 12px",
              border: "1px solid #000",
              borderRadius: 8,
              cursor: creating ? "not-allowed" : "pointer",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>

        {error ? (
          <p style={{ marginTop: 10 }}>
            <strong>Error:</strong> {error}
          </p>
        ) : null}
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Projects
        </h2>

        {loading ? (
          <p>Loading…</p>
        ) : projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul style={{ display: "grid", gap: 8, paddingLeft: 18 }}>
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
