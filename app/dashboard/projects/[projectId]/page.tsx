"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = { id: string; name: string; createdAt?: string };
type Run = { id: string; status: string; createdAt?: string; prompt?: string };

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(
    "Build a modern landing page website with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );
  const [running, setRunning] = useState(false);
  const [runLog, setRunLog] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const pRes = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
      const pJson = await pRes.json();
      if (!pRes.ok || !pJson.ok) throw new Error(pJson.error || "Failed to load project");
      setProject(pJson.project);

      const rRes = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}&includeRuns=1`, {
        cache: "no-store",
      });
      const rJson = await rRes.json();
      if (!rRes.ok || !rJson.ok) throw new Error(rJson.error || "Failed to load runs");
      setRuns(rJson.runs || []);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function startAgent() {
    setRunning(true);
    setRunLog("");
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, prompt }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Agent failed");
      }

      // If API returns runId, jump to it
      if (json.runId) {
        router.push(`/dashboard/runs/${json.runId}`);
        return;
      }

      // fallback: reload
      await load();
    } catch (e: any) {
      setRunLog(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!project) return <div style={{ padding: 24 }}>Project not found.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <div style={{ opacity: 0.7, marginTop: 4 }}>Project ID: {project.id}</div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Back to Dashboard
        </Link>
      </div>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #333", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Generate with Agent</h2>
        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          Enter what you want. Click once. The agent will create a Run and generate files.
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #444" }}
          disabled={running}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={startAgent}
            disabled={running}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #444",
              cursor: running ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {running ? "Running…" : "Generate website (Agent)"}
          </button>
          <button
  onClick={async () => {
    const res = await fetch(`/api/projects/${projectId}/publish`, {
      method: "GET",
    });
    const json = await res.json();

    if (json?.ok && json?.commitUrl) {
      alert("Published successfully!\n\nCommit:\n" + json.commitUrl);
      window.open(json.commitUrl, "_blank");
    } else {
      alert("Publish failed:\n" + (json?.error || "Unknown error"));
    }
  }}
  style={{
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #444",
    cursor: "pointer",
    fontWeight: 600,
    background: "#f4f4f4",
  }}
>
  Publish to GitHub
</button>


          <Link
            href={`/dashboard/projects/${projectId}/new-run`}
            style={{ alignSelf: "center", textDecoration: "underline", opacity: 0.85 }}
          >
            Advanced: Create run manually
          </Link>
        </div>

        {runLog ? (
          <pre style={{ marginTop: 12, padding: 12, background: "#111", borderRadius: 10, overflowX: "auto" }}>
            {runLog}
          </pre>
        ) : null}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Runs</h2>
        {runs.length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            No runs yet. Use <b>Generate website (Agent)</b> above.
          </div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {runs.map((r) => (
              <li key={r.id}>
                <Link href={`/dashboard/runs/${r.id}`} style={{ textDecoration: "underline" }}>
                  {r.id}
                </Link>{" "}
                — {r.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
