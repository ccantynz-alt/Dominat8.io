// app/dashboard/projects/[projectId]/create-run-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRunForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form. Use clean minimal styling."
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = prompt.trim();
    if (!trimmed) {
      setErr("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create run");
      }

      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          width: "100%",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: loading ? "not-allowed" : "pointer",
            background: "white",
          }}
        >
          {loading ? "Creating..." : "Create run"}
        </button>
        {err ? <span style={{ color: "crimson" }}>{err}</span> : null}
      </div>
    </form>
  );
}
