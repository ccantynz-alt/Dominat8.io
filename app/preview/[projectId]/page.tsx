// app/preview/[projectId]/page.tsx
import React from "react";

export const dynamic = "force-dynamic";

type FileRec = { path: string; content: string };

async function getProjectFiles(projectId: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ""; // optional
  const url = `${base}/api/projects/${projectId}/files?t=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null as any };
  }
  const data = await res.json();
  return { ok: true, status: 200, data };
}

// super simple “best-effort” preview for common hero layouts
function extractHero(tsx: string) {
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(tsx)?.[1]?.trim();
  const p = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(tsx)?.[1]?.trim();
  const btn = /<button[^>]*>([\s\S]*?)<\/button>/i.exec(tsx)?.[1]?.trim();

  // strip any JSX braces (very basic)
  const clean = (s?: string) =>
    s?.replace(/\{|\}/g, "").replace(/\s+/g, " ").trim();

  return {
    headline: clean(h1) || null,
    subtitle: clean(p) || null,
    cta: clean(btn) || null,
  };
}

export default async function PreviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const result = await getProjectFiles(projectId);
  if (!result.ok) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Preview</h1>
        <p>Could not load project files.</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          status: {result.status}
        </pre>
      </main>
    );
  }

  const files: FileRec[] = Array.isArray(result.data?.files)
    ? result.data.files
    : [];

  const pageFile =
    files.find((f) => f.path === "app/generated/page.tsx") || files[0];

  if (!pageFile) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Preview</h1>
        <p>No files in this project yet.</p>
      </main>
    );
  }

  const hero = extractHero(pageFile.content);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <section
          style={{
            flex: "1 1 420px",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
            Live preview (best-effort)
          </div>

          <div style={{ padding: 8 }}>
            {hero.headline ? (
              <h1 style={{ fontSize: 36, margin: "0 0 10px 0" }}>
                {hero.headline}
              </h1>
            ) : (
              <h1 style={{ fontSize: 24, margin: 0 }}>
                (Couldn’t detect a &lt;h1&gt; in TSX)
              </h1>
            )}

            {hero.subtitle ? (
              <p style={{ fontSize: 16, opacity: 0.8, marginTop: 0 }}>
                {hero.subtitle}
              </p>
            ) : null}

            {hero.cta ? (
              <button
                type="button"
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {hero.cta}
              </button>
            ) : null}
          </div>

          <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
            Project: <code>{projectId}</code>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            File: <code>{pageFile.path}</code>
          </div>
        </section>

        <section
          style={{
            flex: "1 1 520px",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
            Draft source (from KV)
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {pageFile.content}
          </pre>
        </section>
      </div>
    </main>
  );
}
