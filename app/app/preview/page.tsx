"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetLatestHtml, apiPublish, apiGenerate } from "@/lib/customerFlowApi";

export default function PreviewPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = useMemo(() => sp.get("projectId") || "", [sp]);

  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!projectId) {
        setErr("Missing projectId. Go back and try again.");
        setLoading(false);
        return;
      }
      setErr(null);
      setLoading(true);
      try {
        const data = await apiGetLatestHtml(projectId);
        if (!data.ok || !data.html) throw new Error(data.error || "No generated website HTML found");
        setHtml(data.html);
      } catch (e: any) {
        setErr(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function onPublish() {
    if (!projectId) return;
    setPublishing(true);
    setErr(null);
    try {
      const data = await apiPublish(projectId);
      if (!data.ok) throw new Error(data.error || "Publish failed");
      // If your API returns a URL, great. If not, we can still navigate to /p/<projectId>.
      router.push(`/app/published?projectId=${encodeURIComponent(projectId)}${data.url ? `&url=${encodeURIComponent(data.url)}` : ""}`);
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
      // Quick regen using the same “default prompt”.
      // If you want, we can store the original prompt in the project and reuse it here.
      const prompt =
        "Create a professional business website with a hero section, services, testimonials, about, and contact page. Clean, modern design.";
      const data = await apiGenerate(projectId, prompt);
      if (!data.ok || !data.runId) throw new Error(data.error || "Failed to start regeneration");
      router.push(`/app/generate?projectId=${encodeURIComponent(projectId)}&runId=${encodeURIComponent(data.runId)}`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, margin: 0 }}>Here’s your website</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        You can publish this instantly or regenerate if you want changes.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          onClick={onPublish}
          disabled={publishing || loading}
          style={{ padding: "12px 16px", fontSize: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}
        >
          {publishing ? "Publishing…" : "Publish Website"}
        </button>
        <button
          onClick={onRegenerate}
          disabled={publishing || loading}
          style={{ padding: "12px 16px", fontSize: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)", opacity: 0.85 }}
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
