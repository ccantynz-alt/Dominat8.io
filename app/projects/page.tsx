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
      const res = await fetch("/api/runs", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create run");
      }

      const data = await res.json();

      if (!data?.runId) {
        throw new Error("No runId returned");
      }

      // THIS is the navigation step
      router.push(`/runs/${data.runId}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
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
        <p style={{ marginTop: 12, color: "red" }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}
