// app/admin/program-pages/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type KVProgramPage = {
  category: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  bullets: string[];
  faq: { q: string; a: string }[];
};

export default function AdminProgramPagesPage() {
  const [projectId, setProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [pages, setPages] = useState<KVProgramPage[]>([]);
  const [count, setCount] = useState(0);

  const canRun = useMemo(() => projectId.trim().length > 0, [projectId]);

  async function refreshList(pid: string) {
    setMsg(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(pid)}/program-pages`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load pages");
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setCount(Number(data.count || 0));
    } catch (e: any) {
      setPages([]);
      setCount(0);
      setMsg(e?.message || "Failed to load");
    }
  }

  async function generate() {
    const pid = projectId.trim();
    if (!pid) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(pid)}/program-pages/generate`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Generate failed");
      setMsg(`✅ Generated / updated program pages. Total now: ${data.count ?? "?"}`);
      await refreshList(pid);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Generate failed"}`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    // No auto-load (projectId unknown). User enters projectId first.
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 14 }}>
        <Link href="/admin">← Back to Admin</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 0" }}>
          Programmatic SEO Pages
        </h1>
        <p style={{ margin: "8px 0 0", opacity: 0.85, lineHeight: 1.6 }}>
          One-click generation of high-intent SaaS pages (templates, use-cases, features, comparisons,
          integrations, docs). Stored in KV per project and auto-included in sitemap.
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <label style={{ display: "block", fontWeight: 900, marginBottom: 6 }}>
          Project ID
        </label>
        <input
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="e.g. proj_04694a1afb97498aac59335dc335feac"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            marginBottom: 12,
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={generate}
            disabled={!canRun || busy}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 900,
              cursor: canRun && !busy ? "pointer" : "not-allowed",
              opacity: canRun ? 1 : 0.6,
            }}
          >
            {busy ? "Generating…" : "Generate SEO Pages"}
          </button>

          <button
            onClick={() => projectId.trim() && refreshList(projectId.trim())}
            disabled={!canRun || busy}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 900,
              cursor: canRun && !busy ? "pointer" : "not-allowed",
              opacity: canRun ? 1 : 0.6,
            }}
          >
            Refresh List
          </button>

          {canRun && (
            <>
              <a
                href={`/site/${encodeURIComponent(projectId.trim())}`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Open Public Site
              </a>

              <a
                href={`/site/${encodeURIComponent(projectId.trim())}/sitemap.xml`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Open Sitemap
              </a>
            </>
          )}
        </div>

        {msg && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg}
          </div>
        )}
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Pages ({count})</h2>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            URL format: <code>/site/&lt;projectId&gt;/p/&lt;category&gt;/&lt;slug&gt;</code>
          </div>
        </div>

        {count === 0 ? (
          <div style={{ marginTop: 10, opacity: 0.8 }}>
            No program pages yet. Enter a projectId and click <b>Generate SEO Pages</b>.
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {pages.map((p) => {
              const href = canRun
                ? `/site/${encodeURIComponent(projectId.trim())}/p/${encodeURIComponent(p.category)}/${encodeURIComponent(p.slug)}`
                : "#";
              return (
                <a
                  key={`${p.category}:${p.slug}`}
                  href={href}
                  style={{
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 14,
                    padding: 12,
                    display: "block",
                  }}
                >
                  <div style={{ fontWeight: 950 }}>{p.title}</div>
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>
                    {p.category} / {p.slug}
                  </div>
                  <div style={{ opacity: 0.9, marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                    {p.description}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
