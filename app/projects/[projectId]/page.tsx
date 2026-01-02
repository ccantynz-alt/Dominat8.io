// app/projects/[projectId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Run = {
  id: string;
  status: string;
  createdAt?: string;
};

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState<string>(`You are an elite LOCAL SEO strategist and expert web designer.

GOAL:
Generate a COMPLETE, PRODUCTION-READY MULTI-PAGE WEBSITE that can rank highly in:
- New Zealand
- Australia

STRICT OUTPUT RULES (MUST FOLLOW EXACTLY):
1) Output ONLY a single JSON object. No markdown. No commentary.
2) JSON MUST include:
   - "pages": { "/path": "<!doctype html>...FULL HTML DOCUMENT...</html>" }
   - "pagesMeta": { "/path": { title, description, robots?, canonical?, ogImage?, schemaJsonLd? } }
3) Each pages["/path"] MUST be a FULL valid HTML document with <html>, <head>, <body>.
4) Do NOT output React/JSX/Next.js. HTML ONLY.
5) Use inline CSS or a <style> tag (no external assets).
6) Navigation must work via standard links (<a href="/pricing">Pricing</a> etc).

REQUIRED PAGES:
- "/"
- "/about"
- "/pricing"
- "/contact"

LOCAL SEO REQUIREMENTS (NZ + AU):
- Write naturally, no keyword stuffing.
- Mention New Zealand and Australia in appropriate places.
- Include a short “Service Areas” section that lists major cities in NZ + AU.
- Add trust signals: local expertise, reliability, compliance, years experience, customer care.
- Ensure every page has exactly ONE H1 and clean H2/H3 structure.

ADVANCED SEO REQUIREMENTS:
- pagesMeta titles: 45–60 chars, include primary intent keyword.
- pagesMeta descriptions: 140–160 chars, include keyword + CTA.
- robots default: "index,follow"
- OPTIONAL: canonical and ogImage can be included but not required.

FAQ SCHEMA (RICH RESULTS):
- pagesMeta["/"] MUST include schemaJsonLd with:
  - LocalBusiness schema (or Organization if you prefer)
  - FAQPage schema with 8–10 high-intent FAQs focused on NZ + AU customers

FAQPage schema example:
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer text." }
    }
  ]
}

OUTPUT JSON SHAPE (EXACT KEYS REQUIRED):
{
  "pages": {
    "/": "<!doctype html><html>...</html>",
    "/about": "<!doctype html><html>...</html>",
    "/pricing": "<!doctype html><html>...</html>",
    "/contact": "<!doctype html><html>...</html>"
  },
  "pagesMeta": {
    "/": {
      "title": "...",
      "description": "...",
      "robots": "index,follow",
      "schemaJsonLd": { ... }
    },
    "/about": { "title": "...", "description": "...", "robots": "index,follow" },
    "/pricing": { "title": "...", "description": "...", "robots": "index,follow" },
    "/contact": { "title": "...", "description": "...", "robots": "index,follow" }
  }
}

WEBSITE TOPIC:
Create a modern, premium service business website that could operate in NZ + AU.
Make it trustworthy, conversion-focused, and professional.

Return ONLY the JSON.`);

  async function loadRuns() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load runs");
      setRuns(Array.isArray(data.runs) ? data.runs : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load runs");
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
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create run");
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
          rows={26}
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

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={createRun}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Run Generator
          </button>

          <a
            href={`/site/${projectId}`}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            View Public Site
          </a>

          <a
            href={`/projects/${projectId}/seo`}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            SEO Settings
          </a>
        </div>

        {err && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,0,0,0.25)",
              background: "rgba(255,0,0,0.08)",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}
      </div>

      <div>
        <h2>Runs</h2>
        {loading ? (
          <div style={{ opacity: 0.75 }}>Loading…</div>
        ) : runs.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No runs yet.</div>
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
