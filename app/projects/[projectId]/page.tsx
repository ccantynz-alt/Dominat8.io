// app/projects/[projectId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Run = {
  id: string;
  status: string;
  createdAt?: string;
};

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const projectId = params.projectId;

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(
`You are an expert web designer and front-end engineer.

Your task is to generate a COMPLETE, PRODUCTION-READY MULTI-PAGE WEBSITE.

IMPORTANT OUTPUT RULES (MUST FOLLOW EXACTLY):

1. You MUST return a JSON object.
2. The JSON MUST contain a "pages" object.
3. Each key in "pages" MUST be a URL path starting with "/".
4. Each value in "pages" MUST be a FULL, VALID HTML DOCUMENT.
5. DO NOT include markdown, explanations, or comments outside the JSON.
6. DO NOT include JSX, React, or Next.js code — HTML ONLY.

REQUIRED PAGES:
- "/" (Home)
- "/about"
- "/pricing"
- "/contact"

DESIGN REQUIREMENTS:
- Modern, clean, professional layout
- Responsive (mobile + desktop)
- Consistent navigation across all pages
- Clear headings and sections
- Strong typography hierarchy
- Neutral color palette
- Use inline CSS or <style> tags (no external assets)

CONTENT REQUIREMENTS:
- Homepage: hero section, features, call-to-action
- About: company mission, values, credibility
- Pricing: 2–3 clear pricing tiers
- Contact: contact form + business info (no backend logic)

OUTPUT FORMAT EXAMPLE (STRUCTURE ONLY):

{
  "pages": {
    "/": "<!doctype html><html>...</html>",
    "/about": "<!doctype html><html>...</html>",
    "/pricing": "<!doctype html><html>...</html>",
    "/contact": "<!doctype html><html>...</html>"
  }
}

Now generate the website.
`
  );

  async function loadRuns() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load runs");
      setRuns(Array.isArray(data.runs) ? data.runs : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function createRun() {
    setErr(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create run");
      }
      await loadRuns();
    } catch (e: any) {
      setErr(e?.message || "Failed to create run");
    }
  }

  useEffect(() => {
    loadRuns();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/projects">← Back to Projects</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>
          Project {projectId}
        </h1>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Generate Website</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={22}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
          }}
        />
        <div style={{ marginTop: 10 }}>
          <button
            onClick={createRun}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Run Generator
          </button>
        </div>
      </div>

      <div>
        <h2>Runs</h2>
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div style={{ color: "red" }}>{err}</div>
        ) : runs.length === 0 ? (
          <div>No runs yet.</div>
        ) : (
          <ul>
            {runs.map((r) => (
              <li key={r.id}>
                <Link href={`/projects/${projectId}/runs/${r.id}`}>
                  {r.id} — {r.status}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
