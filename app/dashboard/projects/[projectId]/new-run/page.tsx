"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRunPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const projectId = params.projectId;

  const [prompt, setPrompt] = useState(
    "Generate a simple landing page under app/generated/hello/page.tsx"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to create run");
        setSubmitting(false);
        return;
      }

      router.push(`/dashboard/runs/${data.runId}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create run");
      setSubmitting(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">New Run</h1>
        <div className="text-sm opacity-80">Project: {projectId}</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={8}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md border p-3 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Run"}
        </button>

        <div className="text-sm opacity-80">
          <a className="underline" href={`/dashboard/projects/${projectId}`}>
            Back to project
          </a>
        </div>
      </form>
    </main>
  );
}
