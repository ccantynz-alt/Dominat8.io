"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export default function ProjectsRoute({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [name, setName] = useState("Test");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [projects]);

  async function refreshList() {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Failed to load projects (HTTP ${res.status})`);
    }
    setProjects(Array.isArray(data.projects) ? data.projects : []);
  }

  async function onCreate() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to create project (HTTP ${res.status})`);
      }

      const project: Project = data.project;

      // update local list immediately
      setProjects((prev) => [project, ...prev]);

      // refresh server components & navigate
      router.refresh();
      router.push(`/dashboard/projects/${project.id}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Projects</h1>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard">Dashboard</Link>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            minWidth: 220,
          }}
        />

        <button
          onClick={onCreate}
          disabled={loading || !name.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: loading ? "#eee" : "#111",
            color: loading ? "#111" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Creating..." : "Create project"}
        </button>

        <button
          onClick={() => {
            setErr(null);
            setLoading(true);
            refreshList()
              .catch((e) => setErr(e?.message ?? String(e)))
              .finally(() => setLoading(false));
          }}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: "#fff3f3",
            border: "1px solid #ffd1d1",
            color: "#8a0000",
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </div>
      ) : null}

      <div style={{ marginTop: 18 }}>
        {sorted.length === 0 ? (
          <div style={{ color: "#666" }}>No projects yet.</div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sorted.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>{" "}
                <span style={{ color: "#666", marginLeft: 8 }}>
                  ({p.createdAt})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
