"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PublishedClient() {
  const sp = useSearchParams();

  const projectId = sp?.get("projectId") ?? "";
  const urlFromApi = sp?.get("url") ?? "";

  const liveUrl = urlFromApi || (projectId ? `/p/${projectId}` : "");

  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!liveUrl) return;
    await navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>🎉 Your website is live!</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        Your website has been successfully published and is now accessible online.
      </p>

      <div style={{ marginTop: 18, padding: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Your live website:</div>
        <div style={{ marginTop: 6, fontSize: 16, wordBreak: "break-all" }}>
          {liveUrl || "Missing projectId. Please go back and publish again."}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <a
          href={liveUrl || "#"}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
            pointerEvents: liveUrl ? "auto" : "none",
            opacity: liveUrl ? 1 : 0.6,
          }}
        >
          View Website
        </a>

        <button
          onClick={onCopy}
          disabled={!liveUrl}
          style={{
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            opacity: liveUrl ? 1 : 0.6,
          }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div style={{ marginTop: 18, opacity: 0.75 }}>
        <button disabled style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
          Connect Custom Domain (Pro)
        </button>
      </div>
    </div>
  );
}
