"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Project = {
  id: string;
  name?: string | null;
  createdAt?: string | null;
};

export default function DashboardClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ Fix: treat sp as possibly null (some typings / build modes)
  const emptyMode = useMemo(() => {
    const val = sp?.get("empty");
    return val === "1";
  }, [sp]);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // If you already have an API route for projects, keep it.
        // This is a safe default.
        const res = await fetch("/api/projects", { method: "GET" });
        const text = await res.text();

        if (!res.ok) {
          throw new Error(text || `Failed to load projects (HTTP ${res.status})`);
        }

        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }

        const list: Project[] =
          (data?.projects as Project[]) ||
          (Array.isArray(data) ? (data as Project[]) : []) ||
          [];

        if (!cancelled) {
          setProjects(list);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ marginTop: 8 }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ marginTop: 8, color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  if (emptyMode || projects.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ marginTop: 8 }}>No projects yet.</p>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/projects")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Go to Projects
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
      <p style={{ marginTop: 8 }}>Your projects:</p>

      <ul style={{ marginTop: 12, paddingLeft: 18 }}>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>{p.name || p.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
