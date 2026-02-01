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
  const dig = (error as any)?.digest ? String((error as any).digest) : "";

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", padding: 24, fontFamily: "system-ui, Segoe UI, Roboto, Arial" }}>
          <div style={{ position: "fixed", top: 10, right: 10, zIndex: 999999, padding: "6px 10px", borderRadius: 8, background: "black", border: "1px solid white", color: "white", fontSize: 12, fontFamily: "monospace" }}>
            D8_FAILSAFE_GLOBAL ✓
          </div>

          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Rocket Cockpit (Global Failsafe)</h1>
          <p style={{ marginTop: 10, opacity: 0.85 }}>
            A root rendering error was caught (often in layout). This prevents a hard 500.
          </p>

          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Error</div>
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", whiteSpace: "pre-wrap" }}>
              {msg}{dig ? `\n(digest: ${dig})` : ""}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", background: "white", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}