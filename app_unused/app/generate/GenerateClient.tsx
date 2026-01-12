"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGenerate } from "@/lib/customerFlowApi";

const MESSAGES = [
  "Designing your layout…",
  "Writing professional content…",
  "Structuring your pages…",
  "Finalising your website…",
];

function keyPrompt(projectId: string) {
  return `prompt:${projectId}`;
}
function keyHtml(projectId: string) {
  return `html:${projectId}`;
}

export default function GenerateClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const projectId = sp?.get("projectId") ?? "";

  const [msgIndex, setMsgIndex] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 1600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function run() {
      if (!projectId) {
        setErr("Missing projectId. Go back and try again.");
        return;
      }

      const prompt = sessionStorage.getItem(keyPrompt(projectId)) || "";
      if (!prompt) {
        setErr("Missing prompt. Go back and try again.");
        return;
      }

      setErr(null);

      const data = await apiGenerate(projectId, prompt);

      if (!data.ok || !data.html) {
        setErr(data.error || "Generate failed");
        return;
      }

      sessionStorage.setItem(keyHtml(projectId), data.html);
      router.push(`/app/preview?projectId=${encodeURIComponent(projectId)}`);
    }

    run();
  }, [projectId, router]);

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Your website is being created</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        This usually takes less than a minute. Please don’t close this page.
      </p>

      <div
        style={{
          marginTop: 22,
          padding: 18,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 18 }}>{MESSAGES[msgIndex]}</div>
        <div style={{ marginTop: 10, opacity: 0.65 }}>Project: {projectId}</div>
      </div>

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}
    </div>
  );
}
