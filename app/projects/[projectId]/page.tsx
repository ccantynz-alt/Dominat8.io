"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = { id: string; name: string; createdAt?: string };
type Run = { id: string; status: string; createdAt?: string; prompt?: string };

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = String(params?.projectId || "");

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Try to load a real project (if your API exists)
        const pr = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { cache: "no-store" });

        if (pr.ok) {
          const pj = await pr.json();
          const p = pj?.project || pj;
          if (!cancelled && p?.id) setProject(p);
        } else {
          // Fallback: still show a usable page
          if (!cancelled) setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
        }

        // Try to load runs (if endpoint exists)
        const rr = await fetch(`/api/projects/${encodeURIComponent(projectId)}/runs`, { cache: "no-store" });
        if (rr.ok) {
          const rj = await rr.json();
          const list = Array.isArray(rj?.runs) ? rj.runs : Array.isArray(rj) ? rj : [];
          if (!cancelled) setRuns(list);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "Could not load project.");
          setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (projectId) load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function createRun() {
    try {
      setRunning(true);
      setErr(null);

      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(
          "Run creation failed. (This usually means the /api/projects/[projectId]/runs endpoint isn’t ready yet.)"
        );
      }

      const data = await res.json();
      const newRun = data?.run || data;
      if (newRun?.id) {
        setRuns((prev) => [newRun, ...prev]);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to create run.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>
            {project?.name || "Project"}
          </h1>
          <div style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
            ID: <code>{projectId}</code>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }
