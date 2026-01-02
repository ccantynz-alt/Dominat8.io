"use client";

import { useState } from "react";

export default function SeoManager({
  params,
}: {
  params: { projectId: string };
}) {
  const [keyword, setKeyword] = useState("");
  const [count, setCount] = useState(100);
  const [done, setDone] = useState(false);

  async function generate() {
    await fetch(`/api/projects/${params.projectId}/seo/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, count }),
    });
    setDone(true);
  }

  return (
    <div>
      <h1>Nuclear SEO</h1>

      <input
        placeholder="Core keyword (e.g. AI website builder)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <input
        type="number"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
      />

      <button onClick={generate}>Generate Pages</button>

      {done && <p>✅ SEO pages generated.</p>}
    </div>
  );
}
