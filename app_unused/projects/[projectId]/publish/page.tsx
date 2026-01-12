"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type PublishGetResponse =
  | {
      ok: true;
      projectId: string;
      publishedStatus: string;
      publishedUrl: string;
      publishedAt: string;
      domain: string;
    }
  | { ok: false; error?: string };

export default function PublishProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishedStatus, setPublishedStatus] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [domain, setDomain] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "get", projectId }),
      });

      const data = (await res.json()) as PublishGetResponse;

      if (!res.ok || !("ok" in data) || data.ok !== true) {
        setError((data as any)?.error || `Failed (status ${res.status})`);
        return;
      }

      setPublishedStatus(data.publishedStatus || "");
      setPublishedUrl(data.publishedUrl || "");
      setPublishedAt(data.publishedAt || "");
      setDomain(data.domain || "");
    } catch (e: any) {
      setError(e?.message || "Failed to load publish status");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "publish", projectId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || `Publish failed (status ${res.status})`);
        return;
      }
      await load();
    } catch (e: any) {
      setError(e?.message || "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "unpublish", projectId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || `Unpublish failed (status ${res.status})`);
        return;
      }
      await load();
    } catch (e: any) {
      setError(e?.message || "Unpublish failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const isPublished = (publishedStatus || "").toLowerCase() === "published";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Publish Project</h1>
          <p className="mt-1 text-sm text-gray-600">
            Project: <span className="font-mono">{projectId}</span>
          </p>
        </div>

        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back to Project
        </Link>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4">
        {loading ? (
          <div className="text-sm text-gray-700">Loading…</div>
        ) : error ? (
          <div>
            <div className="text-sm font-semibold text-red-600">
              Something went wrong
            </div>
            <div className="mt-1 text-sm text-gray-700">{error}</div>
            <button
              onClick={load}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isPublished ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
                  ✅ Published
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                  📝 Draft
                </span>
              )}

              {domain ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                  🌐 {domain}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                  🌐 No domain
                </span>
              )}
            </div>

            <div className="text-sm text-gray-700">
              <div>
                <span className="font-semibold">Published URL:</span>{" "}
                {publishedUrl ? (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {publishedUrl}
                  </a>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Published At:</span>{" "}
                {publishedAt ? publishedAt : <span className="text-gray-500">—</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={publish}
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Publish
              </button>

              <button
                onClick={unpublish}
                className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Unpublish
              </button>

              <button
                onClick={load}
                className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Note: If you haven’t attached a domain yet, the Publish URL will fall
              back to your app’s project page. Once you attach a domain, publish again
              and it will use https://your-domain.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
