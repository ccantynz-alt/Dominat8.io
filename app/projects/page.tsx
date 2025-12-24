"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectsPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSimulateRun() {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/runs", { method: "POST" });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        throw new Error(
          `Failed to create run. Status ${res.status}. ${text ? "Body: " + text : ""}`.trim()
        );
      }

      // Parse JSON safely
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          `Create run returned non-JSON. Status ${res.status}. Body: ${text || "(empty)"}`
        );
      }

      if (!data?.runId) {
        throw new Error(`No runId returned. Body: ${text || "(empty)"}`);
      }

      router.push(`/runs/${data.runId}`);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Projects</h1>

      <button onClick={onSimulateRun} disabled={busy}>
        {busy ? "Creating run..." : "Simulate Run"}
      </button>

      {error && (
        <pre style={{ marginTop: 12, color: "red", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}
    </div>
  );
}
