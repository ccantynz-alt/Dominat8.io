"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPublish, apiGenerate } from "@/lib/customerFlowApi";

function keyPrompt(projectId: string) {
  return `prompt:${projectId}`;
}
function keyHtml(projectId: string) {
  return `html:${projectId}`;
}

export default function PreviewClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const projectId = sp?.get("projectId") ?? "";

  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setErr("Missing projectId. Go back and try again.");
      setLoading(false);
      return;
    }

    const stored = sessionStorage.getItem(keyHtml(projectId)) || "";
    if (!stored) {
      setErr("No generated HTML found in this session. Please regenerate.");
      setLoading(false);
      return;
    }

    setHtml(stored);
    setLoading(false);
  }, [projectId]);

  async function onPublish() {
    if (!projectId) return;

    setPublishing(true);
    setErr(null);

    try {
      if (!html) throw new Error("No HTML to publish.");

      const data = await apiPublish(projectId, html);
      if (!data.ok) throw new Error(data.error || "Publish failed");

      router.push(
        `/app/published?projectId=${encodeURIComponent(projectId)}${
          data.url ? `&url=${encodeURIComponent(data.url)}` : ""
        }`
      );
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setPublishing(false);
    }
  }

  async function onRegenerate() {
    if (!projectId) return;

    setErr(null);
    setLoading(true);

    try {
      const prompt = sessionStorage.getItem(keyPrompt(projectId)) || "";
      if (!prompt) throw new Error("Missing prompt. Go back and try again.");

      const data = await apiGenerate(projectId, prompt);
      if (!data.ok || !data.html) throw new Error(data.error || "Regenerate failed");

      sessionStorage.setItem(keyHtml(projectId), data.html);
      setHtml(data.html);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, margin: 0 }}>Here’s your website</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        Preview it below. Publish when you’re ready.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          onClick={onPublish}
          disabled={publishing || loading}
          style={{
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          {publishing ? "Publishing…" : "Publish Website"}
        </button>

        <button
          onClick={onRegenerate}
          disabled={publishing || loading}
          style={{
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            opacity: 0.85,
          }}
        >
          Regenerate
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          height: 720,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.12)",
          background: "white",
        }}
      >
        {loading ? (
          <div style={{ padding: 18, opacity: 0.75 }}>Loading preview…</div>
        ) : (
          <iframe title="preview" srcDoc={html} style={{ width: "100%", height: "100%", border: 0 }} />
        )}
      </div>
    </div>
  );
}
