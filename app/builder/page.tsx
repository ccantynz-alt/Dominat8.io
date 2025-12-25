"use client";

import { useState } from "react";

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);

  async function generate() {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    setResult(await res.json());
  }

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

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
