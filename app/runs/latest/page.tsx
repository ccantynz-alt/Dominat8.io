"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
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

  const [project, setProject] = useState<Project | null>(null);
  const [run, setRun] = useState<Run | null>(null);

  async function loadLatest() {
    setLoading(true);
    setErr(null);

    try {
      const projRes = await fetch("/api/projects", { cache: "no-store" });
      if (!projRes.ok) throw new Error(`Failed to load projects (HTTP ${projRes.status})`);
      const projData = await projRes.json();

      const projects: Project[] = Array.isArray(projData?.projects) ? projData.projects : [];
      if (!projects.length) {
        setProject(null);
        setRun(null);
        setLoading(false);
        return;
      }

      projects.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      const latestProject = projects[0];
      setProject(latestProject);

      const runsRes = await fetch(`/api/projects/${latestProject.id}/runs`, { cache: "no-store" });
      if (!runsRes.ok) throw new Error(`Failed to load runs (HTTP ${runsRes.status})`);
      const runsData = await runsRes.json();

      const runs: Run[] = Array.isArray(runsData?.runs) ? runsData.runs : [];
      if (!runs.length) {
        setRun(null);
        setLoading(false);
        return;
      }

      runs.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      setRun(runs[0]);

      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to load latest run");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatest();
  }, []);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.4rem", margin: 0 }}>Latest Run Output</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            Shows the newest run from the newest project (from KV).
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={loadLatest} style={buttonStyle}>Refresh</button>
      </div>

      {loading && <p style={{ marginTop: 18 }}>Loading…</p>}

      {err && <div style={errorStyle}>Error: {err}</div>}

      {!loading && !err && !project && (
        <div style={cardStyle}>
          No projects found yet. Go to <a href="/templates">Templates</a> and create one.
        </div>
      )}

      {!loading && !err && project && !run && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 700 }}>Project: {project.name}</div>
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            No runs found for this project yet.
          </div>
        </div>
      )}

      {!loading && !err && project && run && (
        <div style={{ marginTop: 18 }}>
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Project: {project.name}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              Project ID: <code>{project.id}</code>
            </div>
          </div>

          <div style={{ marginTop: 14, ...cardStyle }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Run</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              Run ID: <code>{run.id}</code>
            </div>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              Status: <b>{run.status}</b>
            </div>

            <div style={{ marginTop: 14, fontWeight: 700 }}>Prompt</div>
            <pre style={preStyle}>{run.prompt}</pre>

            <div style={{ marginTop: 14, fontWeight: 700 }}>Output</div>
            <pre style={preStyle}>{run.output || "(No output yet)"}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1rem",
  background: "#fff",
};

const errorStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 12,
  border: "1px solid #ffb4b4",
  background: "#ffecec",
  borderRadius: 10,
  color: "#6b0000",
  fontSize: 14,
};

const preStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 12,
  background: "#f7f7f7",
  borderRadius: 10,
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.4,
};
