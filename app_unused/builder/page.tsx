"use client";

import { useMemo, useState } from "react";

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Request failed");
        setFiles(null);
        return;
      }

      if (!data?.files) {
        setError("No files returned");
        setFiles(null);
        return;
      }

      setFiles(data.files);
    } catch (e: any) {
      setError(e?.message || "Client error");
      setFiles(null);
    } finally {
      setLoading(false);
    }
  }

  const srcDoc = useMemo(() => {
    if (!files) return "";
    const html = files["preview.html"] || "<main><h1>No HTML returned</h1></main>";
    const css = files["preview.css"] || "";
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
  </body>
</html>`;
  }, [files]);

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>AI Website Builder</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the website you want..."
        style={{ width: "100%", height: 120, padding: 12 }}
      />

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? "Generating..." : "Generate"}
        </button>
        {error && <span style={{ color: "crimson" }}>{error}</span>}
      </div>

      {files && (
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Live Preview</h3>
          <iframe
            title="preview"
            sandbox=""
            style={{
              width: "100%",
              height: 520,
              border: "1px solid #ddd",
              borderRadius: 8,
              background: "white",
            }}
            srcDoc={srcDoc}
          />

          <h3 style={{ margin: 0 }}>Generated Files</h3>
          <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #eee", padding: 12 }}>
            {JSON.stringify(files, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
