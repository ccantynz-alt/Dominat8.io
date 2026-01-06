"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectBadges from "./ProjectBadges";

type ProjectRow = {
  id: string;
  name: string;
  createdAt?: string | null;

  published: boolean;
  domain?: string | null;
  domainStatus?: "pending" | "verified" | null;
};

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [name, setName] = useState("");

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });
    return copy;
  }, [projects]);

  async function loadProjects() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to load projects (${res.status})`);
      }

      setProjects(data.projects || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "New project" }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to create project (${res.status})`);
      }

      setName("");
      await loadProjects();
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Projects
      </h1>

      {/* Create box */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          background: "white",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          Create a new project
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name (optional)"
            style={{
              flex: "1 1 280px",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 14,
            }}
          />

          <button
            onClick={createProject}
            disabled={creating}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: creating ? "#9ca3af" : "#111827",
              color: "white",
              fontWeight: 800,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "Creating..." : "Create project"}
          </button>

          <button
            onClick={loadProjects}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              background: loading ? "#f3f4f6" : "white",
              color: "#111827",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 700 }}>
            {error}
          </div>
        ) : null}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: "#6b7280", fontWeight: 700 }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div style={{ color: "#6b7280", fontWeight: 700 }}>
          No projects yet — create one above.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {project.id}
                  </div>
                </div>

                <ProjectBadges
                  published={project.published}
                  domain={project.domain ?? null}
                  domainStatus={project.domainStatus ?? null}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <a
                  href={`/projects/${project.id}`}
                  style={{ color: "#2563eb", fontWeight: 800, fontSize: 14 }}
                >
                  Open project →
                </a>

                {project.published ? (
                  <span style={{ marginLeft: 12, fontSize: 14 }}>
                    <a
                      href={`/p/${project.id}`}
                      style={{ color: "#16a34a", fontWeight: 800 }}
                    >
                      View public →
                    </a>
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
