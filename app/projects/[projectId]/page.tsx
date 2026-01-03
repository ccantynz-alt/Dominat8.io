"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Project = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  seedPrompt?: string;
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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params?.projectId || "");

  const [project, setProject] = useState<Project | null>(null);

  const [prompt, setPrompt] = useState(
    "Build a modern landing page with hero, pricing, FAQ, and contact form. Use clean, minimal styling."
  );

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadProjectAndRuns() {
    setLoading(true);
    setErr(null);

    try {
      // 1) Load project from API list (simple approach)
      const pRes = await fetch("/api/projects", { cache: "no-store" });
      const pJson = await pRes.json();
      const list: Project[] = Array.isArray(pJson?.projects) ? pJson.projects : [];

      const found = list.find((p) => p.id === projectId) || null;

      // Fallback to localStorage if not found in API
      if (!found) {
        try {
          const raw = localStorage.getItem(`project:${projectId}`);
          if (raw) {
            const lp = JSON.parse(raw) as Project;
            setProject(lp);
            if (lp?.seedPrompt) setPrompt(lp.seedPrompt);
          } else {
            setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
          }
        } catch {
          setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
        }
      } else {
        setProject(found);
        if (found.seedPrompt) setPrompt(found.seedPrompt);
      }

      // 2) Load runs for this project
      const rRes = await fetch(`/api/projects/${projectId}/runs`, { cache: "no-store" });
      const rJson = await rRes.json();
      const rList: Run[] = Array.isArray(rJson?.runs) ? rJson.runs : [];
      setRuns(rList);

      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to load project");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjectAndRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function createRun() {
    setBusy("create");
    setErr(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Failed to create run");

      await loadProjectAndRuns();
      setBusy(null);
    } catch (e: any) {
      setErr(e?.message || "Failed to create run");
      setBusy(null);
    }
  }

  async function executeRun(runId: string) {
    setBusy(runId);
    setErr(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runId}/execute`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Failed to execute run");

      await loadProjectAndRuns();

      // open generated page
      window.location.href = "/generated";
    } catch (e: any) {
      setErr(e?.message || "Failed to execute run");
      setBusy(null);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>{project?.name || "Project"}</h1>
          <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
            ID: <code>{projectId}</code>
          </div>
          {project?.templateName && (
            <div style={{ marginTop: 8, color: "#111", fontSize: 14 }}>
              Template: <b>{project.templateName}</b>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/runs/latest" style={linkStyle}>Latest Run</a>
          <a href="/generated" style={linkStyle}>Generated</a>
        </div>
      </div>

      {err && (
        <div style={errorStyle}>
          Error: {err}
        </div>
      )}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Run Prompt</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={createRun}
            disabled={busy === "create"}
            style={{
              ...buttonStyle,
              background: busy === "create" ? "#ddd" : "#000",
              color: busy === "create" ? "#333" : "#fff",
              cursor: busy === "create" ? "not-allowed" : "pointer",
            }}
          >
            {busy === "create" ? "Creating…" : "Create Run"}
          </button>

          <a href="/generated" style={{ ...buttonStyle, display: "inline-block", textAlign: "center", textDecoration: "none" }}>
            View Generated
          </a>

          <button onClick={loadProjectAndRuns} style={buttonStyle}>
            Refresh
          </button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Runs</h2>

        {loading && <p>Loading…</p>}

        {!loading && runs.length === 0 && (
          <div style={cardStyle}>
            No runs yet. Click <b>Create Run</b>.
          </div>
        )}

        {!loading && runs.length > 0 && (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {runs.map((r) => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {r.status.toUpperCase()}{" "}
                      <span style={{ fontWeight: 400, color: "#666", fontSize: 13 }}>
                        ({new Date(r.createdAt).toLocaleString()})
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                      Run ID: <code>{r.id}</code>
                    </div>
                  </div>

                  <button
                    onClick={() => executeRun(r.id)}
                    disabled={busy === r.id}
                    style={{
                      ...buttonStyle,
                      background: busy === r.id ? "#ddd" : "#000",
                      color: busy === r.id ? "#333" : "#fff",
                      cursor: busy === r.id ? "not-allowed" : "pointer",
                      minWidth: 130,
                      height: 40,
                      alignSelf: "center",
                    }}
                  >
                    {busy === r.id ? "Running…" : "Execute"}
                  </button>
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: "pointer" }}>View prompt/output</summary>
                  <div style={{ marginTop: 8, fontSize: 13, color: "#444", fontWeight: 700 }}>Prompt</div>
                  <pre style={preStyle}>{r.prompt}</pre>
                  {r.output && (
                    <>
                      <div style={{ marginTop: 8, fontSize: 13, color: "#444", fontWeight: 700 }}>Output</div>
                      <pre style={preStyle}>{r.output}</pre>
                    </>
                  )}
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
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
