"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function keyPrompt(projectId: string) {
  return `prompt:${projectId}`;
}

export default function CreateClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const projectId = sp?.get("projectId") ?? "";

  const [prompt, setPrompt] = useState(
    "Create a professional business website with a hero section, services, testimonials, about, and contact page. Clean, modern design."
  );
  const [err, setErr] = useState<string | null>(null);

  function onGenerate() {
    if (!projectId) {
      setErr("Missing projectId. Go back to Dashboard and click Create Website again.");
      return;
    }

    setErr(null);
    sessionStorage.setItem(keyPrompt(projectId), prompt);

    router.push(`/app/generate?projectId=${encodeURIComponent(projectId)}`);
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
        style={{
          marginTop: 16,
          padding: "14px 18px",
          fontSize: 18,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
      >
        Generate Website
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
