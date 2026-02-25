"use client";

import { useState, useRef } from "react";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function FixPage() {
  const [html, setHtml] = useState("");
  const [prompt, setPrompt] = useState("");
  const [fixedHtml, setFixedHtml] = useState("");
  const [status, setStatus] = useState<"idle" | "fixing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function runFix() {
    if (!html.trim()) {
      setError("Paste the HTML to fix.");
      return;
    }
    setError("");
    setFixedHtml("");
    setStatus("fixing");
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/io/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: html.trim(), prompt: prompt.trim() || undefined }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const text = await res.text();
        setError(text || `Error ${res.status}`);
        setStatus("error");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let out = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        out += decoder.decode(value, { stream: true });
        setFixedHtml(out);
      }
      setStatus("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Request failed");
      setStatus("error");
    }
  }

  function copyFixed() {
    if (fixedHtml) navigator.clipboard.writeText(fixedHtml);
  }

  return (
    <GoldFogPageLayout title="Fix">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Paste your site HTML and we&apos;ll fix layout, typography, responsiveness, and broken scripts.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label className="gold-fog-label">Original brief (optional)</label>
          <input
            className="gold-fog-input"
            type="text"
            placeholder="e.g. Real estate landing page"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="gold-fog-label">HTML to fix</label>
          <textarea
            className="gold-fog-textarea"
            placeholder="Paste full HTML here…"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            style={{ minHeight: 160 }}
          />
        </div>
        <button type="button" className="gold-fog-btn" onClick={runFix} disabled={status === "fixing"}>
          {status === "fixing" ? "Fixing…" : "Fix site"}
        </button>
        {error && <p style={{ color: "rgba(255,100,100,0.9)", marginTop: 12, fontSize: 14 }}>{error}</p>}
      </div>
      {fixedHtml && (
        <div className="gold-fog-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "rgba(255,255,255,0.9)" }}>Fixed HTML</h2>
            <button type="button" className="gold-fog-btn gold-fog-btn--secondary" onClick={copyFixed}>
              Copy
            </button>
          </div>
          <textarea
            readOnly
            className="gold-fog-textarea"
            value={fixedHtml}
            style={{ minHeight: 200, fontFamily: "ui-monospace, monospace", fontSize: 12 }}
          />
          <p className="gold-fog-muted" style={{ marginTop: 12 }}>
            Preview: paste the result into the Builder or save as .html and open in a browser.
          </p>
        </div>
      )}
    </GoldFogPageLayout>
  );
}
