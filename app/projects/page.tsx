"use client";

import { useEffect, useState } from "react";

type ProjectRow = {
  id: string;
  name: string;
  createdAt?: string | null;

  published: boolean;
  hasHtml: boolean;

  domain?: string | null;
  domainStatus?: "pending" | "verified" | null;
};

function Badge({
  text,
  bg,
  color,
  title,
}: {
  text: string;
  bg: string;
  color: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: bg,
        color,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {text}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [recoverId, setRecoverId] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load projects");
      }

      setProjects(data.projects || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    if (creating) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "New project" }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data.project?.id) {
        throw new Error(data?.error || "Project creation failed");
      }

      window.location.href = `/projects/${data.project.id}`;
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
      setCreating(false);
    }
  }

  async function recoverProject() {
    if (recovering) return;

    const id = recoverId.trim();
    if (!id.startsWith("proj_")) {
      setError("Recover project: please paste a proj_… ID");
      return;
    }

    setRecovering(true);
    setError(null);

    try {
      const res = await fetch("/api/projects/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Recover failed");
      }

      setRecoverId("");
      await loadProjects();
    } catch (e: any) {
      setError(e?.message || "Recover failed");
    } finally {
      setRecovering(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Projects</h1>

        <button
          onClick={loadProjects}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #d1d5db",
            background: loading ? "#f3f4f6" : "white",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Create new */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          background: "white",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 8 }}>
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
              borderRadius: 12,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />

          <button
            onClick={createProject}
            disabled={creating}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: creating ? "#9ca3af" : "#111827",
              color: "white",
              fontWeight: 900,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "Creating…" : "Create project"}
          </button>
        </div>
      </div>

      {/* Recover */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          background: "white",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 8 }}>
          Recover an existing project (paste a proj_… id)
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={recoverId}
            onChange={(e) => setRecoverId(e.target.value)}
            placeholder="proj_123…"
            style={{
              flex: "1 1 280px",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />

          <button
            onClick={recoverProject}
            disabled={recovering}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: recovering ? "#9ca3af" : "white",
              color: "#111827",
              fontWeight: 900,
              cursor: recovering ? "not-allowed" : "pointer",
            }}
          >
            {recovering ? "Recovering…" : "Recover project"}
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
          Tip: Open any project page once and it will auto-appear in this list.
        </div>

        {error ? (
          <div style={{ marginTop: 10, color: "#991b1b", fontWeight: 900 }}>
            {error}
          </div>
        ) : null}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ fontWeight: 900, color: "#6b7280" }}>Loading…</div>
      ) : projects.length === 0 ? (
        <div style={{ fontWeight: 900, color: "#6b7280" }}>
          No projects yet. (Create one, or recover an existing proj_… id above.)
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {p.id}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {p.published ? (
                    <Badge text="Published" bg="#16a34a" color="white" />
                  ) : (
                    <Badge text="Unpublished" bg="#9ca3af" color="white" />
                  )}

                  {p.hasHtml ? (
                    <Badge text="Has HTML" bg="#111827" color="white" />
                  ) : (
                    <Badge text="No HTML" bg="#e5e7eb" color="#374151" />
                  )}

                  {p.domain ? (
                    p.domainStatus === "verified" ? (
                      <Badge text={`Domain: ${p.domain}`} bg="#2563eb" color="white" />
                    ) : (
                      <Badge text="Domain: Pending" bg="#f59e0b" color="white" title={p.domain} />
                    )
                  ) : (
                    <Badge text="No domain" bg="#e5e7eb" color="#374151" />
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={`/projects/${p.id}`} style={{ color: "#2563eb", fontWeight: 900 }}>
                  Open project →
                </a>

                {p.published ? (
                  <a
                    href={`/p/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#16a34a", fontWeight: 900 }}
                  >
                    Open public →
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
