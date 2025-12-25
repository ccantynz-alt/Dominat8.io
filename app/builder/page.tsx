"use client";

import { useState } from "react";

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<any>(null);

  async function generate() {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setFiles(data.files);
  }

  const PageComponent = files?.["app/page.tsx"]
    ? new Function(
        "React",
        `return ${files["app/page.tsx"]
          .replace(/import.*?;/g, "")
          .replace("export default", "")}`
      )(require("react"))
    : null;

  return (
    <main style={{ padding: 40 }}>
      <h1>AI Website Builder</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the website you want..."
        style={{ width: "100%", height: 120 }}
      />

      <button onClick={generate} style={{ marginTop: 12 }}>
        Generate
      </button>

      {PageComponent && (
        <div style={{ marginTop: 40, border: "1px solid #ddd" }}>
          <h3>Live Preview</h3>
          <PageComponent />
        </div>
      )}
    </main>
  );
}
