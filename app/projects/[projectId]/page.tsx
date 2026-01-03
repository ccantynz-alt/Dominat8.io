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
  const [prompt, setPrompt] = useState("");
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const pRes = await fetch("/api/projects", { cache: "no-store" });
      const pJson = await pRes.json();
      const projects: Project[] = pJson?.projects || [];
      const found = projects.find((p) => p.id === projectId) || null;

      if (found) {
        setProject(found);
        if (found.seedPrompt) setPrompt(found.seedPrompt);
      } else {
        setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
      }

      const rRes = await fetch(`/api/projects/${projectId}/runs`, { cache: "no-store" });
      const rJson = await rRes.json();
      setRuns(rJson?.runs || []);

      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to load project");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
      if (!json?.ok) throw new Error("Failed to create run");

      await load();
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
      const res = await fetch(
        `/api/projects/${projectId}/runs/${runId}/execute`,
        { method: "POST" }
      );

      const json = await res.json();
      if (!json?.ok) throw new Error("Failed to execute run");

      await load();
      window.location.href = `/generated/${runId}`;
    } catch (e: any) {
      setErr(e?.message || "Failed to execute run");
      setBusy(null);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1>{project?.name || "Project"}</h1>
      <p>ID: <code>{projectId}</code></p>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <section>
        <h2>Prompt</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          style={{ width: "100%", padding: 10 }}
        />
        <button onClick={createRun} disabled={busy === "create"}>
          {busy === "create" ? "Creating…" : "Create Run"}
        </button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Runs</h2>

        {loading && <p>Loading…</p>}

        {!loading && runs.map((r) => (
          <div key={r.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
            <b>{r.status.toUpperCase()}</b>
            <div>Run ID: <code>{r.id}</code></div>

            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => executeRun(r.id)}
                disabled={busy === r.id}
              >
                {busy === r.id ? "Running…" : "Execute"}
              </button>

              <a
                href={`/generated/${r.id}`}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #000",
                  textDecoration: "none",
                  borderRadius: 6,
                }}
              >
                View Generated for this Run
              </a>
            </div>

            <details style={{ marginTop: 10 }}>
              <summary>View prompt / output</summary>
              <pre>{r.prompt}</pre>
              {r.output && <pre>{r.output}</pre>}
            </details>
          </div>
        ))}
      </section>
    </main>
  );
}
