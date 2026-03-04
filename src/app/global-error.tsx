"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const msg = error?.message ? String(error.message) : "unknown";
  const dig = error?.digest ? String(error.digest) : "";

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#030712", color: "#E8F0FF", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 24, opacity: 0.5 }}>&#9888;&#65039;</div>
          <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Something went wrong.</h1>
          <p style={{ margin: "0 0 28px", fontSize: 15, color: "rgba(200,220,255,0.45)", maxWidth: 420, textAlign: "center", lineHeight: 1.65 }}>
            A root rendering error was caught. This fallback prevents a hard 500.
          </p>

          <div style={{ padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(100,180,255,0.08)", background: "rgba(100,180,255,0.03)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12, color: "rgba(200,220,255,0.40)", maxWidth: 480, width: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6, marginBottom: 28 }}>
            {msg}{dig ? `\n(digest: ${dig})` : ""}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.10)", color: "rgba(0,212,255,0.92)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(100,180,255,0.10)", background: "rgba(100,180,255,0.03)", color: "rgba(200,220,255,0.60)", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
