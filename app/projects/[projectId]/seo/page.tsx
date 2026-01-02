// app/projects/[projectId]/seo/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProjectSEO = {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  canonicalBase?: string;
  robots?: string;
  ogImage?: string;
  twitterCard?: string;
};

export default function ProjectSEOPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const [seo, setSeo] = useState<ProjectSEO>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/seo`, { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load SEO");
      setSeo(data.seo || {});
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save SEO");
      setSeo(data.seo || seo);
      setOk("Saved SEO settings.");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href={`/projects/${projectId}`}>← Back to Project</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 0" }}>
          SEO Settings
        </h1>
        <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
          These settings inject SEO tags into <code>/site/{projectId}</code> pages as real HTML responses.
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        {loading ? (
          <div style={{ opacity: 0.75 }}>Loading…</div>
        ) : (
          <>
            <Field
              label="Site Name"
              value={seo.siteName || ""}
              onChange={(v) => setSeo({ ...seo, siteName: v })}
              placeholder="Book A Ride NZ"
            />
            <Field
              label="Default Title"
              value={seo.defaultTitle || ""}
              onChange={(v) => setSeo({ ...seo, defaultTitle: v })}
              placeholder="Airport Shuttle & Private Transfers"
            />
            <Field
              label="Title Template"
              value={seo.titleTemplate || "{page} | {site}"}
              onChange={(v) => setSeo({ ...seo, titleTemplate: v })}
              placeholder="{page} | {site}"
              hint='Use {page} and {site}. Example: "{page} | {site}"'
            />
            <Field
              label="Default Description"
              value={seo.defaultDescription || ""}
              onChange={(v) => setSeo({ ...seo, defaultDescription: v })}
              placeholder="Premium airport transfers, 24/7 support, fixed pricing."
              textarea
            />
            <Field
              label="Canonical Base URL"
              value={seo.canonicalBase || ""}
              onChange={(v) => setSeo({ ...seo, canonicalBase: v })}
              placeholder="https://yourdomain.com"
              hint="Important: set this to your real domain so canonical URLs are correct."
            />
            <Field
              label="Robots"
              value={seo.robots || "index,follow"}
              onChange={(v) => setSeo({ ...seo, robots: v })}
              placeholder="index,follow"
              hint='Use "noindex,nofollow" for staging.'
            />
            <Field
              label="OpenGraph Image URL"
              value={seo.ogImage || ""}
              onChange={(v) => setSeo({ ...seo, ogImage: v })}
              placeholder="https://yourdomain.com/og.png"
            />
            <Field
              label="Twitter Card"
              value={seo.twitterCard || "summary_large_image"}
              onChange={(v) => setSeo({ ...seo, twitterCard: v })}
              placeholder="summary_large_image"
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.65 : 1,
                  fontWeight: 900,
                }}
              >
                {saving ? "Saving…" : "Save SEO"}
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
                View Site
              </a>
            </div>

            {(err || ok) && (
              <div style={{ marginTop: 14 }}>
                {err && (
                  <div
                    style={{
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
                {ok && (
                  <div
                    style={{
                      marginTop: err ? 10 : 0,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,255,0,0.18)",
                      background: "rgba(0,255,0,0.07)",
                      fontSize: 13,
                    }}
                  >
                    {ok}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
}) {
  const { label, value, onChange, placeholder, hint, textarea } = props;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
          }}
        />
      )}
      {hint && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>{hint}</div>}
    </div>
  );
}
