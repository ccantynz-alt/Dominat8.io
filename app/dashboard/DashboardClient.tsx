// app/dashboard/DashboardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Project = {
  projectId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  filesCount?: number;
  lastRunId?: string;
};

type RunItem = {
  runId: string;
  projectId: string;
  createdAt: string;
  filesCount: number;
  prompt: string;
};

function prettyJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

export default function DashboardClient() {
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [runs, setRuns] = useState<RunItem[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [newProjectName, setNewProjectName] = useState("My Project");
  const [prompt, setPrompt] = useState(
    "Create app/generated/page.tsx that renders a homepage with a big headline and a button."
  );

  const [runRes, setRunRes] = useState<any>(null);
  const [filesRes, setFilesRes] = useState<any>(null);
  const [applyRes, setApplyRes] = useState<any>(null);
  const [projectFilesRes, setProjectFilesRes] = useState<any>(null);

  const runId = useMemo(() => {
    if (!runRes || runRes.ok !== true) return "";
    return runRes.runId || "";
  }, [runRes]);

  async function refreshProjects() {
    const r = await fetch("/api/projects", { method: "GET" });
    const j = await r.json().catch(() => null);
    if (j && j.ok) {
      setProjects(j.projects || []);
      if (!selectedProjectId && (j.projects || []).length > 0) {
        setSelectedProjectId(j.projects[0].projectId);
      }
    }
  }

  async function refreshRuns() {
    const r = await fetch("/api/runs", { method: "GET" });
    const j = await r.json().catch(() => null);
    if (j && j.ok) setRuns(j.runs || []);
  }

  useEffect(() => {
    refreshProjects();
    refreshRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProject() {
    setLoading(true);
    setApplyRes(null);
    try {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      const j = await r.json().catch(() => null);
      await refreshProjects();
      if (j && j.ok && j.project?.projectId) {
        setSelectedProjectId(j.project.projectId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runAgent() {
    if (!selectedProjectId) {
      setRunRes({ ok: false, error: "Select or create a project first." });
      return;
    }

    setLoading(true);
    setRunRes(null);
    setFilesRes(null);
    setApplyRes(null);

    try {
      const r = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, prompt }),
      });

      const j = await r.json().catch(() => null);
      setRunRes(j);

      if (j && j.ok && j.runId) {
        const fr = await fetch("/api/runs/" + j.runId + "/files", { method: "GET" });
        const fj = await fr.json().catch(() => null);
        setFilesRes(fj);
        await refreshRuns();
      }
    } finally {
      setLoading(false);
    }
  }

  async function applyRunToProject(runIdToApply: string) {
    if (!selectedProjectId) return;

    setLoading(true);
    setApplyRes(null);
    setProjectFilesRes(null);

    try {
      const r = await fetch("/api/projects/" + selectedProjectId + "/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: runIdToApply }),
      });
      const j = await r.json().catch(() => null);
      setApplyRes(j);

      await refreshProjects();

      const pr = await fetch("/api/projects/" + selectedProjectId + "/files", { method: "GET" });
      const pj = await pr.json().catch(() => null);
      setProjectFilesRes(pj);
    } finally {
      setLoading(false);
    }
  }

  const filesUrl = runId ? "/api/runs/" + runId + "/files" : "";
  const zipUrl = runId ? "/api/runs/" + runId + "/zip" : "";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Projects */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Projects</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", minWidth: 220 }}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name} ({p.projectId})
              </option>
            ))}
          </select>

          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", minWidth: 220 }}
          />

          <button
            onClick={createProject}
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #222",
              background: loading ? "#eee" : "#111",
              color: loading ? "#444" : "white",
              fontWeight: 800,
            }}
          >
            Create Project
          </button>
        </div>

        <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
          Tip: pick a project first, then “Run Agent”.
        </div>
      </div>

      {/* Run Agent */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Run Agent</div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={runAgent}
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #222",
              background: loading ? "#eee" : "#111",
              color: loading ? "#444" : "white",
              fontWeight: 800,
            }}
          >
            {loading ? "Working…" : "Run Agent"}
          </button>

          {runId ? (
            <>
              <a
                href={filesUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #222",
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: 800,
                  background: "white",
                }}
              >
                View Run Files (JSON)
              </a>

              <a
                href={zipUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #222",
                  textDecoration: "none",
                  color: "white",
                  fontWeight: 800,
                  background: "#111",
                }}
              >
                Download Run ZIP
              </a>

              <button
                onClick={() => applyRunToProject(runId)}
                disabled={loading || !selectedProjectId}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #0a7",
                  background: loading ? "#eee" : "#0a7",
                  color: loading ? "#444" : "white",
                  fontWeight: 900,
                }}
              >
                Apply Run → Project
              </button>
            </>
          ) : null}
        </div>

        {runRes ? (
          <pre style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fafafa", overflowX: "auto", fontSize: 12 }}>
            {prettyJson(runRes)}
          </pre>
        ) : null}

        {filesRes ? (
          <pre style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fafafa", overflowX: "auto", fontSize: 12 }}>
            {prettyJson(filesRes)}
          </pre>
        ) : null}

        {applyRes ? (
          <pre style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fafafa", overflowX: "auto", fontSize: 12 }}>
            {prettyJson(applyRes)}
          </pre>
        ) : null}

        {projectFilesRes ? (
          <pre style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fafafa", overflowX: "auto", fontSize: 12 }}>
            {prettyJson(projectFilesRes)}
          </pre>
        ) : null}
      </div>

      {/* Runs history */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Run History</div>

        <button
          onClick={refreshRuns}
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "white",
            color: "#111",
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          Refresh Runs
        </button>

        <div style={{ display: "grid", gap: 10 }}>
          {runs.map((r) => (
            <div key={r.runId} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" }}>
              <div style={{ fontWeight: 900 }}>Run: {r.runId}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                Project: {r.projectId} • Files: {r.filesCount} • {r.createdAt}
              </div>
              <div style={{ fontSize: 12, marginTop: 6, fontFamily: "ui-monospace, monospace" }}>
                {r.prompt}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={"/api/runs/" + r.runId + "/files"}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #222",
                    textDecoration: "none",
                    color: "#111",
                    fontWeight: 800,
                    background: "white",
                  }}
                >
                  View Files
                </a>

                <a
                  href={"/api/runs/" + r.runId + "/zip"}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #222",
                    textDecoration: "none",
                    color: "white",
                    fontWeight: 800,
                    background: "#111",
                  }}
                >
                  Download ZIP
                </a>

                <button
                  onClick={() => applyRunToProject(r.runId)}
                  disabled={loading || !selectedProjectId}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #0a7",
                    background: "#0a7",
                    color: "white",
                    fontWeight: 900,
                  }}
                >
                  Apply → Selected Project
                </button>
              </div>
            </div>
          ))}
          {runs.length === 0 ? <div style={{ color: "#666" }}>No runs yet. Click “Run Agent”.</div> : null}
        </div>
      </div>
    </div>
  );
}
