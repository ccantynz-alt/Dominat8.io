import Head from "next/head";

function safeProjectHref(projectId: string | undefined, suffix: string) {
  const pid = (projectId || '').trim();
  if (!pid) return '/projects';
  const s = suffix.startsWith('/') ? suffix : '/' + suffix;
  return ('/projects/' + pid + s).replace(/\/{2,}/g, '/');
}

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Step = {
  step?: string;
  ok?: boolean;
  status?: number;
  ms?: number;
  url?: string;
  bodyFirst200?: string;
  error?: string;
};

type RunDetail = {
  runId: string;
  projectId: string;
  createdAtIso: string;
  status: "running" | "ok" | "fail";
  marker?: string;
  jobId?: string;
  steps: Step[];
};

export default function RunDetailPage() {
  const router = useRouter();
  const projectId = (router.query.projectId as string) || "";
  const runId = (router.query.runId as string) || "";

  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState<RunDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!projectId || !runId) return;
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`/api' + safeProjectHref(projectId as any, 'runs') + '/${runId}?ts=` + Date.now(), {
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to load run");
      setRun(j.run);
    } catch (e: any) {
      setError(e?.message || "Failed to load run");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId, runId]);

  return (
    <>
      <Head>
        <title>Run — {runId || "..."}</title>
      </Head>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Run detail</h1>
          <span className="rounded-full border px-3 py-1 text-sm text-gray-700">
            {projectId || "(loading...)"}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`' + safeProjectHref(projectId as any, 'runs') + '`}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back to runs
          </Link>

          <Link
            href={`' + safeProjectHref(projectId as any, 'publish') + '`}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Publish
          </Link>

          <button
            onClick={load}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : !run ? (
          <div className="rounded-lg border p-6 text-sm text-gray-700">No data.</div>
        ) : (
          <>
            <div className="mb-6 rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-gray-700">{run.runId}</span>
                <span
                  className={[
                    "rounded-full border px-2 py-1 text-xs",
                    run.status === "ok"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : run.status === "fail"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-200 bg-gray-50 text-gray-700",
                  ].join(" ")}
                >
                  {run.status}
                </span>
                <span className="text-xs text-gray-600">{run.createdAtIso}</span>
              </div>

              {run.marker ? (
                <div className="mt-2 text-xs text-gray-700">marker: {run.marker}</div>
              ) : null}

              {run.jobId ? (
                <div className="mt-1 text-xs text-gray-700">jobId: {run.jobId}</div>
              ) : null}
            </div>

            <div className="space-y-3">
              {run.steps.map((s, idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{s.step || `step-${idx + 1}`}</div>

                    {typeof s.ok === "boolean" ? (
                      <span
                        className={[
                          "rounded-full border px-2 py-1 text-xs",
                          s.ok
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}
                      >
                        {s.ok ? "OK" : "FAIL"}
                      </span>
                    ) : null}

                    {typeof s.status === "number" ? (
                      <span className="rounded-full border px-2 py-1 text-xs text-gray-700">
                        status {s.status}
                      </span>
                    ) : null}

                    {typeof s.ms === "number" ? (
                      <span className="rounded-full border px-2 py-1 text-xs text-gray-700">
                        {s.ms} ms
                      </span>
                    ) : null}
                  </div>

                  {s.url ? (
                    <div className="mt-2 text-xs text-gray-600 break-all">url: {s.url}</div>
                  ) : null}

                  {s.error ? (
                    <div className="mt-2 text-sm text-red-700">{s.error}</div>
                  ) : null}

                  {s.bodyFirst200 ? (
                    <pre className="mt-3 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
{s.bodyFirst200}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
