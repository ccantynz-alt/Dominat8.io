"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
};

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  output?: string;
};

export default function LatestRunPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  async function loadLatestRun() {
    setLoading(true);
    setErr(null);

    try {
      // 1) Load all projects
      const projRes = await fetch("/api/projects", { cache: "no-store" });
      if (!projRes.ok) throw new Error("Failed to load projects");
      const projData = await projRes.json();
      const projects: Project[] = projData.projects || [];

      let newestRun: Run | null = null;
      let newestProject: Project | null = null;

      // 2) For each project, load runs
      for (const p of projects) {
        const runsRes = await fetch(`/api/projects/${p.id}/runs`, { cache: "no-store" });
        if (!runsRes.ok) continue;

        const runsData = await runsRes.json();
        const runs: Run[] = runsData.runs || [];

        for (const r of runs) {
          if (!newestRun || r.createdAt > newestRun.createdAt) {
            newestRun = r;
            newestProject = p;
          }
        }
      }

      setRun(newestRun);
      setProject(newestProject);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to load latest run");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatestRun();
  }, []);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.4rem" }}>Latest Run Output</h1>
      <p style={{ color: "#555" }}>
        Shows the most recent run across all projects.
      </p>

      <button onClick={loadLatestRun} style={buttonStyle}>
        Refresh
      </button>

      {loading && <p style={{ marginTop: 20 }}>Loading…</p>}

      {err && <div style={errorStyle}>Error: {err}</div>}

      {!loading && !err && !run && (
        <div style={cardStyle}>No runs found yet.</div>
      )}

      {!loading && !err && run && project && (
        <div style={{ marginTop: 20 }}>
          <div style={cardStyle}>
            <b>Project:</b> {project.name}
            <br />
            <b>Project ID:</b> <code>{project.id}</code>
          </div>

          <div style={{ marginTop: 12, ...cardStyle }}>
            <b>Status:</b> {run.status}
            <br />
            <b>Run ID:</b> <code>{run.id}</code>
            <br />
            <b>Created:</b> {new Date(run.createdAt).toLocaleString()}

            <div style={{ marginTop: 12 }}>
              <b>Prompt</b>
              <pre style={preStyle}>{run.prompt}</pre>
            </div>

            <div style={{ marginTop: 12 }}>
              <b>Output</b>
              <pre style={preStyle}>{run.output}</pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "0.6rem 1rem",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  marginTop: 12,
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: "1rem",
  background: "#fff",
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  border: "1px solid #ffb4b4",
  background: "#ffecec",
  borderRadius: 10,
  color: "#6b0000",
};

const preStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 12,
  background: "#f7f7f7",
  borderRadius: 10,
  whiteSpace: "pre-wrap",
  fontSize: 13,
};
