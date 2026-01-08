"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRunStatus } from "@/lib/customerFlowApi";

const MESSAGES = [
  "Designing your layout…",
  "Writing professional content…",
  "Structuring your pages…",
  "Finalising your website…",
];

export default function GeneratingPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = useMemo(() => sp.get("projectId") || "", [sp]);
  const runId = useMemo(() => sp.get("runId") || "", [sp]);

  const [msgIndex, setMsgIndex] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!projectId || !runId) {
      setErr("Missing projectId/runId. Go back and try again.");
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const data = await apiRunStatus(projectId, runId);
        if (!data.ok || !data.run) throw new Error(data.error || "Could not read run status");

        if (cancelled) return;

        if (data.run.status === "complete") {
          router.push(`/app/preview?projectId=${encodeURIComponent(projectId)}`);
          return;
        }

        if (data.run.status === "error") {
          throw new Error(data.run.error || "Generation failed");
        }

        setTimeout(poll, 1500);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Something went wrong");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [projectId, runId, router]);

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Your website is being created</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        This may take up to 60 seconds. Please don’t close this page.
      </p>

      <div style={{ marginTop: 22, padding: 18, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
        <div style={{ fontSize: 18 }}>{MESSAGES[msgIndex]}</div>
        <div style={{ marginTop: 10, opacity: 0.65 }}>Run: {runId}</div>
      </div>

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}
    </div>
  );
}
