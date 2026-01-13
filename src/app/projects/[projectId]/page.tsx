"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  prompt?: string | null;
  generatedHtml?: string | null;
  lastGeneratedAt?: number | null;
};

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const hasPreview = useMemo(() => !!project?.generatedHtml, [project?.generatedHtml]);

  async function loadProject() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Project not found");
      setProject(json.project);
      setPrompt(json.project?.prompt || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Generate failed");
      setProject(json.project);
      setPrompt(json.project?.prompt || prompt);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/projects" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
          ← Back to projects
        </Link>
        <button
          onClick={loadProject}
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm font-semibold text-zinc-500">Loading project…</p>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : project ? (
        <>
          <h1 className="mt-6 text-3xl font-extrabold text-zinc-900">{project.name}</h1>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-zinc-600">Project ID</div>
              <div className="mt-1 font-mono text-sm text-zinc-900">{project.id}</div>

              <div className="mt-6 text-sm font-extrabold text-zinc-900">Generate</div>
              <p className="mt-2 text-sm font-semibold text-zinc-600">
                Enter a prompt, generate a clean HTML preview, and store it on this project.
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Create a premium SaaS landing page for a website builder with hero, features, and CTA."'
                className="mt-4 h-32 w-full rounded-xl border border-zinc-200 p-4 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
              />

              <div className="mt-4 flex gap-3">
                <button
                  onClick={generate}
                  disabled={busy}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900 disabled:opacity-60"
                >
                  {busy ? "Generating…" : "Generate preview"}
                </button>

                <button
                  disabled
                  className="rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-500"
                >
                  Publish (next)
                </button>
              </div>

              <div className="mt-4 text-xs font-semibold text-zinc-500">
                Last generated:{" "}
                {project.lastGeneratedAt ? new Date(project.lastGeneratedAt).toLocaleString() : "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-sm font-extrabold text-zinc-900">Live preview</div>
                <div className="text-xs font-semibold text-zinc-500">
                  {hasPreview ? "Generated" : "Not generated yet"}
                </div>
              </div>

              {hasPreview ? (
                <iframe
                  title="preview"
                  className="h-[520px] w-full rounded-xl border border-zinc-200 bg-white"
                  srcDoc={project.generatedHtml || ""}
                />
              ) : (
                <div className="m-3 rounded-xl border border-dashed border-zinc-200 p-6 text-sm font-semibold text-zinc-600">
                  No preview yet. Click <span className="font-extrabold">Generate preview</span>.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
