// app/projects/[projectId]/PublishPanel.tsx
"use client";

import React, { useState } from "react";

export default function PublishPanel({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const publicUrl = `/p/${projectId}`;

  async function publish() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Publish failed");
      }

      setMsg("✅ Published! Open the public link below.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Publish failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Publish</div>

      <button
        onClick={publish}
        disabled={busy}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: busy ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {busy ? "Publishing…" : "Publish latest generated site"}
      </button>

      <div style={{ marginTop: 10, fontSize: 14 }}>
        Public URL: <a href={publicUrl}>{publicUrl}</a>
      </div>

      {msg ? <div style={{ marginTop: 10, fontSize: 14 }}>{msg}</div> : null}
    </div>
  );
}
