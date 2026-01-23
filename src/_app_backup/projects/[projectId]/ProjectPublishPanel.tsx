// src/app/projects/[projectId]/ProjectPublishPanel.tsx
"use client";

import { useMemo, useState } from "react";

type Props = { projectId: string };
type ApiResult = { status: number; text: string };

async function postText(path: string): Promise<ApiResult> {
  const r = await fetch(path, { method: "POST" });
  const text = await r.text();
  return { status: r.status, text };
}

function tryParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function ProjectPublishPanel({ projectId }: Props) {
  const [busy, setBusy] = useState<null | "seed" | "publish">(null);
  const [seedResult, setSeedResult] = useState<ApiResult | null>(null);
  const [publishResult, setPublishResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publishJson = useMemo(() => {
    if (!publishResult?.text) return null;
    return tryParseJson(publishResult.text);
  }, [publishResult]);

  const publicUrlPath: string | null = useMemo(() => {
    const p = publishJson?.publicUrl;
    if (typeof p === "string" && p.startsWith("/")) return p;
    if (projectId) return `/p/${projectId}`;
    return null;
  }, [publishJson, projectId]);

  const publicUrlAbsolute = useMemo(() => {
    if (!publicUrlPath) return null;
    return `${window.location.origin}${publicUrlPath}`;
  }, [publicUrlPath]);

  async function onSeed() {
    setError(null);
    setSeedResult(null);
    setCopied(false);
    setBusy("seed");

    try {
      const res = await postText(`/api/projects/${projectId}/seed-spec`);
      setSeedResult(res);
      if (res.status >= 400) setError(`seed-spec failed (${res.status}). See response below.`);
    } catch (e: any) {
      setError(e?.message || "seed-spec failed (unknown error)");
    } finally {
      setBusy(null);
    }
  }

  async function onPublish() {
    setError(null);
    setPublishResult(null);
    setCopied(false);
    setBusy("publish");

    try {
      const res = await postText(`/api/projects/${projectId}/publish`);
      setPublishResult(res);
      if (res.status >= 400) setError(`publish failed (${res.status}). See response below.`);
    } catch (e: any) {
      setError(e?.message || "publish failed (unknown error)");
    } finally {
      setBusy(null);
    }
  }

  async function onCopy() {
    if (!publicUrlAbsolute) return;
    try {
      await navigator.clipboard.writeText(publicUrlAbsolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900">Publish</div>
          <div className="mt-1 text-sm text-neutral-600">
            Seed a draft spec (optional), then publish to generate a public URL.
          </div>
        </div>
        <div className="text-xs text-neutral-500 font-mono">projectId: {projectId}</div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSeed}
          disabled={!!busy}
          className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
        >
          {busy === "seed" ? "Seeding..." : "Seed draft spec"}
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={!!busy}
          className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy === "publish" ? "Publishing..." : "Publish"}
        </button>
      </div>

      {publicUrlAbsolute ? (
        <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="text-sm font-semibold text-neutral-900">Public URL</div>
          <div className="mt-2 break-all rounded-2xl bg-white p-3 font-mono text-xs text-neutral-700">
            {publicUrlAbsolute}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={publicUrlPath || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Open public page
            </a>

            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-semibold">seed-spec response</div>
          <div className="mt-2 text-xs text-neutral-600">
            Status: <span className="font-mono">{seedResult?.status ?? "-"}</span>
          </div>
          <pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-700">
{seedResult?.text ?? "(not run)"}{" "}
          </pre>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-semibold">publish response</div>
          <div className="mt-2 text-xs text-neutral-600">
            Status: <span className="font-mono">{publishResult?.status ?? "-"}</span>
          </div>
          <pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-700">
{publishResult?.text ?? "(not run)"}{" "}
          </pre>
        </div>
      </div>
    </div>
  );
}
