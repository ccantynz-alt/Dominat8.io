"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Project = { id: string; name: string; createdAt?: string };

export default function DashboardPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const emptyMode = useMemo(() => sp.get("empty") === "1", [sp]);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("My Project");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load projects");

      setProjects(Array.isArray(json.projects) ? json.projects : []);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Create failed");

      const id = json?.project?.id || json?.project?.projectId || json?.projectId;
      if (!id) throw new Error("Created project but no id returned");

      router.replace(`/dashboard/projects/${id}`);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  // If NOT in empty mode and we already have projects, go to first project automatically.
  useEffect(() => {
    if (!emptyMode && !loading && projects.length > 0) {
      router.replace(`/dashboard/projects/${projects[0].id}`);
    }
  }, [emptyMode, loading, projects, router]);

  if (!emptyMode) {
    // Redirect mode UI
    return (
      <div style={{ padding: 32 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Redirecting to your project…
        </div>

        {loading ? (
          <div style={{ opacity: 0.7 }}>Loading projects…</div>
        ) : projects.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No projects found → going to create screen.</div>
        ) : (
          <div style={{ opacity: 0.7 }}>Found projects → opening…</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => router.replace("/dashboard?empty=1")}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #444",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Create a project
            </button>
          </div>
        )}
      </div>
    );
  }

  // Empty mode create screen UI
  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div style={{ opacity: 0.75, marginBottom: 18 }}>
        Create your first project to start generating pages.
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>New Project</div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            marginBottom: 12,
          }}
        />

        <button
          onClick={createProject}
          disabled={busy || !name.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 700,
            background: "#111",
            color: "#fff",
          }}
        >
          {busy ? "Creating…" : "Create Project"}
        </button>

        <button
          onClick={load}
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #444",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 600,
            marginLeft: 12,
            background: "#f4f4f4",
          }}
        >
          Refre
