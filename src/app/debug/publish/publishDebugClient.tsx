"use client";

import * as React from "react";

type PublishResult =
  | {
      ok: true;
      projectId: string;
      publicUrl: string;
      publishedAtIso?: string;
    }
  | {
      ok: false;
      error: string;
    };

export default function PublishDebugClient() {
  const [projectId, setProjectId] = React.useState<string>(
    "proj_e3cea824d0f04ffea0209197496c7818"
  );
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<number | null>(null);
  const [raw, setRaw] = React.useState<string>("");
  const [json, setJson] = React.useState<PublishResult | null>(null);

  async function runPublish() {
    setBusy(true);
    setStatus(null);
    setRaw("");
    setJson(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });

      setStatus(res.status);

      const text = await res.text();
      setRaw(text);

      try {
        const parsed = JSON.parse(text) as PublishResult;
        setJson(parsed);
      } catch {
        setJson(null);
      }
    } finally {
      setBusy(false);
    }
  }

  const publicUrl =
    json && (json as any).ok === true ? (json as any).publicUrl : null;

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white">
      <label className="block text-sm font-medium mb-2">Project ID</label>
      <input
        className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        placeholder="proj_..."
      />

      <button
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
        onClick={runPublish}
        disabled={busy || !projectId.trim()}
      >
        {busy ? "Publishing…" : "Publish"}
      </button>

      <div className="mt-6 grid gap-3">
        <div className="text-sm">
          <span className="font-medium">HTTP status:</span>{" "}
          <span className="font-mono">{status ?? "—"}</span>
        </div>

        {publicUrl ? (
          <div className="text-sm">
            <span className="font-medium">Public URL:</span>{" "}
            <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
          </div>
        ) : null}

        <div>
          <div className="text-sm font-medium mb-2">Raw response</div>
          <pre className="text-xs bg-gray-50 border rounded-lg p-3 overflow-auto">
            {raw || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
