"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { OnboardingPanel } from "@/components/OnboardingPanel";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/Notice";
import { Badge } from "@/components/ui/Badge";

type Project = { id: string; name: string; createdAt?: string };
type Run = { id: string; status: string; createdAt?: string; prompt?: string; files?: { path: string }[] };

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

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    commitUrl?: string;
    sha?: string;
    liveUrl?: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const pRes = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`, {
        cache: "no-store",
      });
      const pJson = await pRes.json();
      if (!pRes.ok || !pJson.ok) throw new Error(pJson.error || "Failed to load project");
      setProject(pJson.project);

      const rRes = await fetch(
        `/api/projects?projectId=${encodeURIComponent(projectId)}&includeRuns=1`,
        { cache: "no-store" }
      );
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
  }, [projectId]);

  async function startAgent() {
    setRunning(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, prompt }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Agent failed");
      }

      if (json.runId) {
        router.push(`/dashboard/runs/${json.runId}`);
        return;
      }

      await load();
    } catch (e: any) {
      alert(e?.message || "Agent failed");
    } finally {
      setRunning(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Publish failed");
      }

      setPublishResult({
        commitUrl: json.commitUrl,
        sha: json.sha,
        liveUrl: json.liveUrl,
      });
      setPublishOpen(false);
    } catch (e: any) {
      alert(e?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!project) return <div style={{ padding: 24 }}>Project not found.</div>;

  const lastRun = runs[0];

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      {/* Onboarding */}
      <OnboardingPanel ctaHref={`/dashboard/projects/${projectId}`} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <div style={{ opacity: 0.7, display: "flex", gap: 8, alignItems: "center" }}>
            Project ID: {project.id}
            <Badge tone="draft">Draft Preview</Badge>
          </div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Agent box */}
      <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Generate with AI</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          disabled={running || publishing}
          style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={startAgent}
            disabled={running || publishing}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              cursor: running ? "not-allowed" : "pointer",
              fontWeight: 600,
              background: "black",
              color: "white",
            }}
          >
            {running ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Spinner /> Generating real Next.js files…
              </span>
            ) : (
              "Generate website"
            )}
          </button>

          <button
            onClick={() => setPublishOpen(true)}
            disabled={running || publishing}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              cursor: publishing ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Publish to GitHub
          </button>

          <Link
            href={`/dashboard/projects/${projectId}/new-run`}
            style={{ alignSelf: "center", textDecoration: "underline", opacity: 0.8 }}
          >
            Advanced: Create run manually
          </Link>
        </div>
      </div>

      {/* Last run summary */}
      {lastRun ? (
        <div style={{ marginTop: 24 }}>
          <Notice title="Last run">
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {lastRun.createdAt ? new Date(lastRun.createdAt).toLocaleString() : ""}
            </div>
            {lastRun.files?.length ? (
              <ul style={{ marginTop: 8 }}>
                {lastRun.files.slice(0, 6).map((f) => (
                  <li key={f.path} style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {f.path}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ marginTop: 8 }}>Files generated or updated.</div>
            )}
          </Notice>
        </div>
      ) : null}

      {/* Publish success */}
      {publishResult ? (
        <div style={{ marginTop: 24 }}>
          <Notice title="✅ Published successfully" tone="success">
            {publishResult.sha ? (
              <div>
                Commit: <code>{publishResult.sha}</code>
              </div>
            ) : null}
            {publishResult.commitUrl ? (
              <div>
                GitHub:{" "}
                <a href={publishResult.commitUrl} target="_blank" rel="noreferrer">
                  View commit
                </a>
              </div>
            ) : null}
            {publishResult.liveUrl ? (
              <div>
                Live:{" "}
                <a href={publishResult.liveUrl} target="_blank" rel="noreferrer">
                  Open site
                </a>
              </div>
            ) : null}
          </Notice>
        </div>
      ) : null}

      {/* Runs list */}
      <div style={{ marginTop: 32 }}>
        <h2>Runs</h2>
        {runs.length === 0 ? (
          <div>No runs yet.</div>
        ) : (
          <ul>
            {runs.map((r) => (
              <li key={r.id}>
                <Link href={`/dashboard/runs/${r.id}`}>{r.id}</Link> — {r.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Publish modal */}
      <Modal
        open={publishOpen}
        title="Publish to GitHub?"
        confirmText="Publish"
        loading={publishing}
        onClose={() => setPublishOpen(false)}
        onConfirm={publish}
      >
        <p style={{ marginTop: 0 }}>
          This will commit all current project files and deploy the site live.
        </p>
      </Modal>
    </div>
  );
}
