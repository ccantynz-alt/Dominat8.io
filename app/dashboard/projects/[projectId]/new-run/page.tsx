// app/dashboard/projects/[projectId]/new-run/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRunPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);

    const res = await fetch("/api/agents/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: params.projectId, prompt }),
    });

    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setErr(data?.error ?? "Failed to start run");
      return;
    }

    router.push(`/dashboard/runs/${data.runId}`);
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>New Run</h1>
      <p>Describe what you want the agent to build/change.</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        style={{ width: "100%", maxWidth: 800 }}
        placeholder='Example: "Create a landing page template with pricing + FAQ + testimonials. Add a /templates page."'
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={submit} disabled={busy || !prompt.trim()}>
          {busy ? "Running…" : "Run Agent"}
        </button>
      </div>

      {err && <p style={{ marginTop: 12, color: "crimson" }}>{err}</p>}
    </main>
  );
}
