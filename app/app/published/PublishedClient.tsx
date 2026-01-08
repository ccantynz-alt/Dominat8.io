"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PublishedClient() {
  const sp = useSearchParams();
  const projectId = sp?.get("projectId") ?? "";
  const urlFromQuery = sp?.get("url") ?? "";

  const publicPath = useMemo(() => {
    if (urlFromQuery) return urlFromQuery;
    if (!projectId) return "";
    return `/p/${projectId}`;
  }, [projectId, urlFromQuery]);

  const publicUrl = useMemo(() => {
    if (!publicPath) return "";
    // Make absolute URL for easy copy/paste
    if (publicPath.startsWith("http")) return publicPath;
    return `${window.location.origin}${publicPath}`;
  }, [publicPath]);

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, margin: 0 }}>✅ Published!</h1>
      <p style={{ fontSize: 16, opacity: 0.75, marginTop: 10 }}>
        Your website is live. Share this link with anyone.
      </p>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.7 }}>Public link</div>
        <div style={{ marginTop: 8, fontSize: 16, wordBreak: "break-all" }}>
          {publicUrl ? (
            <a href={publicPath} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
          ) : (
            <span style={{ opacity: 0.7 }}>Missing projectId — go back and publish again.</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <a
            href={publicPath || "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              pointerEvents: publicPath ? "auto" : "none",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              textDecoration: "none",
              display: "inline-block",
              opacity: publicPath ? 1 : 0.5,
            }}
          >
            View website
          </a>

          <button
            onClick={copyLink}
            disabled={!publicUrl}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              cursor: publicUrl ? "pointer" : "not-allowed",
              opacity: publicUrl ? 1 : 0.5,
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18, opacity: 0.7, fontSize: 14 }}>
        Project ID: <code>{projectId || "unknown"}</code>
      </div>
    </div>
  );
}
