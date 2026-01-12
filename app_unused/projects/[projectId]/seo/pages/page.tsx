"use client";

import { useEffect, useState } from "react";

type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  keyword: string;
  createdAt: string;
  ai?: { model: string; version: string };
};

export default function SeoPagesManager({
  params,
}: {
  params: { projectId: string };
}) {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/projects/${params.projectId}/seo/pages`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load pages");
      setPages(data.pages || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function del(slug: string) {
    if (!confirm(`Delete page "${slug}"?`)) return;
    setBusySlug(slug);
    setErr(null);

    try {
      const res = await fetch(
        `/api/projects/${params.projectId}/seo/pages/${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusySlug(null);
    }
  }

  async function regen(slug: string) {
    const intent = prompt("Regenerate intent (e.g. pricing, guide, near me, comparison).", "improve") || "improve";
    setBusySlug(slug);
    setErr(null);

    try {
      const res = await fetch(
        `/api/projects/${params.projectId}/seo/pages/${encodeURIComponent(slug)}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent }),
        }
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Regenerate failed");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Regenerate failed");
    } finally {
      setBusySlug(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publicBase = `/site/${params.projectId}`;

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>SEO Pages</h1>

      <div style={{ marginTop: 8 }}>
        <a href={`/projects/${params.projectId}/seo/ai`}>AI Generator</a>
        {" • "}
        <a href={`/projects/${params.projectId}/seo`}>SEO Settings</a>
      </div>

      <button style={{ marginTop: 12 }} onClick={load} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>

      {err ? <p style={{ marginTop: 12 }}>❌ {err}</p> : null}

      {pages.length === 0 && !loading ? (
        <p style={{ marginTop: 16 }}>No pages yet. Generate some first.</p>
      ) : null}

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {pages.map((p) => {
          const busy = busySlug === p.slug;
          const url = `${publicBase}/${p.slug}`;

          return (
            <div key={p.slug} style={{ border: "1px solid #ddd", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>{p.description}</div>
                  <div style={{ marginTop: 8, opacity: 0.8 }}>
                    <div>
                      Slug: <code>{p.slug}</code>
                    </div>
                    <div>
                      Keyword: <code>{p.keyword}</code>
                    </div>
                    <div>
                      Created: <code>{new Date(p.createdAt).toLocaleString()}</code>
                    </div>
                    {p.ai?.model ? (
                      <div>
                        AI: <code>{p.ai.model}</code> <code>{p.ai.version}</code>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                  <a href={url} target="_blank" rel="noreferrer">
                    Open public page →
                  </a>

                  <button onClick={() => regen(p.slug)} disabled={busy}>
                    {busy ? "Working..." : "Regenerate"}
                  </button>

                  <button onClick={() => del(p.slug)} disabled={busy}>
                    {busy ? "Working..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
