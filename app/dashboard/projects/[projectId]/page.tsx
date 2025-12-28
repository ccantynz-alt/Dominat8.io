"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ---------- Inline UI components (no imports) ---------- */

function Spinner() {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        display: "inline-block",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "rgba(245,158,11,0.15)",
        color: "rgb(180,83,9)",
        border: "1px solid rgba(245,158,11,0.3)",
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        marginLeft: 8,
      }}
    >
      {children}
    </span>
  );
}

function Notice({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: 14,
        padding: 14,
        background: "rgba(0,0,0,0.04)",
      }}
    >
      {title && <strong>{title}</strong>}
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function Modal({
  open,
  title,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          padding: 20,
          borderRadius: 16,
          width: 420,
        }}
      >
        <h3>{title}</h3>
        <p>This will commit all current files and deploy live.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}>
            {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

type Project = { id: string; name: string };
type Run = { id: string; status: string; createdAt?: string };

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState(
    "Build a modern landing page website with pricing, FAQ, and a contact form."
  );
  const [running, setRunning] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/projects?projectId=${projectId}&includeRuns=1`);
    const json = await res.json();
    setProject(json.project);
    setRuns(json.runs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function runAgent() {
    setRunning(true);
    await fetch("/api/agents/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, prompt }),
    });
    setRunning(false);
    load();
  }

  async function publish() {
    setPublishing(true);
    await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
    setPublishing(false);
    setPublishOpen(false);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!project) return <div style={{ padding: 24 }}>Project not found</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>
        {project.name}
        <Badge>Draft Preview</Badge>
      </h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{ width: "100%", marginTop: 12 }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <button onClick={runAgent} disabled={running}>
          {running ? (
            <>
              <Spinner /> Generating…
            </>
          ) : (
            "Generate website"
          )}
        </button>

        <button onClick={() => setPublishOpen(true)}>Publish</button>
      </div>

      {runs[0] && (
        <div style={{ marginTop: 24 }}>
          <Notice title="Last run">
            {runs[0].id} — {runs[0].status}
          </Notice>
        </div>
      )}

      <Modal
        open={publishOpen}
        title="Publish to GitHub?"
        onClose={() => setPublishOpen(false)}
        onConfirm={publish}
        loading={publishing}
      />

      <div style={{ marginTop: 32 }}>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}
