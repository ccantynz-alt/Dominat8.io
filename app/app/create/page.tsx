"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { apiGenerate } from "@/lib/customerFlowApi";

export default function CreateWebsitePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = useMemo(() => sp.get("projectId") || "", [sp]);

  const [prompt, setPrompt] = useState(
    "Create a professional business website with a hero section, services, testimonials, about, and contact page. Clean, modern design."
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onGenerate() {
    if (!projectId) {
      setErr("Missing projectId. Go back to Dashboard and click Create Website again.");
      return;
    }
    setErr(null);
    setLoading(true);

    try {
      const data = await apiGenerate(projectId, prompt);
      if (!data.ok || !data.runId) throw new Error(data.error || "Failed to start generation");

      router.push(
        `/app/generate?projectId=${encodeURIComponent(projectId)}&runId=${encodeURIComponent(data.runId)}`
      );
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Describe your website</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        Tell us what your business does. The more clear you are, the better your website will be.
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          fontSize: 16,
        }}
      />

      <button
        onClick={onGenerate}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: "14px 18px",
          fontSize: 18,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Starting…" : "Generate Website"}
      </button>

      <p style={{ marginTop: 10, opacity: 0.7 }}>This usually takes less than 60 seconds.</p>

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}
    </div>
  );
}
