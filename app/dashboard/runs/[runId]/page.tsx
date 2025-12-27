"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RunRecord = {
  id: string;
  projectId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  prompt?: string;
  error?: string;
  fileCount?: number;
};

type GenFile = { path: string; content: string };

export default function RunPage({ params }: { params: { runId: string } }) {
  const runId = params.runId;

  const [run, setRun] = useState<RunRecord | null>(null);
  const [files, setFiles] = useState<GenFile[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const looksLikePlaceholder =
    !runId || runId === "[runId]" || runId.includes("%5B") || runId.includes("%5D");

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // If user somehow navigated to /dashboard/runs/[runId], stop early with a helpful message.
      if (looksLikePlaceholder) {
        setRun(null);
        setFiles([]);
        setErr(
          `You are on the placeholder route "/dashboard/runs/[runId]". You need a real run id like "run_...".\n\nGo back to Dashboard → open a Project → click a real Run from the list, or generate a new Run.`
        );
        return;
      }

      // Fetch run record (optional endpoint; if you don't have it, we still show files)
      // If this 404s, we'll ignore it.
      try {
        const r = await fetch(`/api/runs/${encodeURIComponent(runId)}`, { cache: "no-store" });
        if (r.ok) {
          const rj = await r.json();
          if (rj?.ok && rj?.run) setRun(rj.run);
        }
      } catch {}

      // Fetch generated files for this run (you DO have this endpoint)
      const f = await fetch(`/api/runs/${encodeURIComponent(runId)}/files`, { cache: "no-store" });
      const fj = await f.json();
      if (!f.ok || !fj?.ok) throw new Error(fj?.error || "Failed to load run files");

      setFiles(Array.isArray(fj.files) ? fj.files : []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const zipHref = looksLikePlaceholder ? "#" : `/api/runs/${encodeURIComponent(runId)}/zip`;

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Run</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Run ID: {runId}</div>
          {run?.status ? <div style={{ opacity: 0.8, marginTop: 6 }}>Status: {run.status}</div> : null}
          {run?.error ? <div style={{ marginTop: 8, color: "#ff6b6b" }}>Error: {run.error}</div> : null}
        </div>

        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Back to Dashboard
        </Link>
      </div>

      {loading ? <div style={{ marginTop: 16 }}>Loading…</div> : null}

      {err ? (
        <pre style={{ marginTop: 16, padding: 12, background: "#111", borderRadius: 10, whiteSpace: "pre-wrap" }}>
          {err}
        </pre>
      ) : null}

      {!looksLikePlaceholder && !loading ? (
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={zipHref}
            style={{
              padding: "10px 14px",
              border: "1px solid #444",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Download ZIP
          </a>

          <button
            onClick={load}
            style={{ padding: "10px 14px", border: "1px solid #444", borderRadius: 10, cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 8 }}>Files generated: {files.length}</h2>

        {files.length === 0 && !err && !looksLikePlaceholder && !loading ? (
          <div style={{ opacity: 0.8 }}>
            No files found for this run yet. If the run is still “running”, hit Refresh in a few seconds.
          </div>
        ) : null}

        {files.length > 0 ? (
          <div style={{ border: "1px solid #333", borderRadius: 12, overflow: "hidden" }}>
            {files.map((f) => (
              <details key={f.path} style={{ borderTop: "1px solid #222", padding: 12 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{f.path}</summary>
                <pre style={{ marginTop: 10, padding: 12, background: "#111", borderRadius: 10, overflowX: "auto" }}>
                  {f.content}
                </pre>
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
