// app/preview/[projectId]/[[...slug]]/page.tsx
import React from "react";
import { kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

type GenFile = { path: string; content: string };

type ProjectRecord = {
  projectId: string;
  userId: string;
  files: GenFile[];
  updatedAt: string;
};

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, "");
}

function pickGeneratedPage(files: GenFile[], slug?: string[]) {
  const clean = (slug || []).filter(Boolean);

  const target =
    clean.length === 0
      ? "app/generated/page.tsx"
      : `app/generated/${clean.join("/")}/page.tsx`;

  const found = files.find((f) => normalizePath(f.path) === target);
  return { target, found };
}

function PreviewNav({ projectId }: { projectId: string }) {
  const base = `/preview/${projectId}`;
  const linkStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
    textDecoration: "none",
    color: "inherit",
    background: "rgba(0,0,0,0.03)",
  };

  const wrap: React.CSSProperties = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  };

  return (
    <nav style={wrap}>
      <a href={base} style={linkStyle}>
        Home
      </a>
      <a href={`${base}/about`} style={linkStyle}>
        About
      </a>
      <a href={`${base}/pricing`} style={linkStyle}>
        Pricing
      </a>
      <a href={`${base}/contact`} style={linkStyle}>
        Contact
      </a>
    </nav>
  );
}

/**
 * VISUAL PREVIEW (BEST-EFFORT)
 * We cannot execute TSX from KV directly. Instead we:
 * 1) extract the JSX inside `return ( ... );`
 * 2) convert it into safe-ish HTML
 * 3) render it with dangerouslySetInnerHTML after sanitizing
 *
 * This works great for simple pages and is a huge UX upgrade.
 */

function extractReturnBlock(tsx: string) {
  // Grab content between: return (  ...  );
  const match = tsx.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;\s*/m);
  if (!match) return null;
  return match[1];
}

function jsxToHtmlBestEffort(jsx: string) {
  // Very small conversions commonly seen in your generated pages
  let html = jsx;

  // Remove React fragments <>...</> (best-effort)
  html = html.replace(/<>/g, "").replace(/<\/>/g, "");

  // Convert className -> class (if present)
  html = html.replace(/\bclassName=/g, "class=");

  // Convert self-closing tags like <br /> to <br>
  html = html.replace(/<br\s*\/>/g, "<br>");

  // Remove JavaScript expressions: { ... }
  // (we can't safely evaluate these in this preview mode)
  html = html.replace(/\{[\s\S]*?\}/g, "");

  return html.trim();
}

function sanitizeHtml(html: string) {
  // Minimal sanitization:
  // - strip <script> blocks
  // - strip on* handlers (onclick, onload, etc.)
  // - strip javascript: URLs
  let out = html;

  out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/\son\w+\s*=\s*["'][\s\S]*?["']/gi, "");
  out = out.replace(/\son\w+\s*=\s*{[\s\S]*?}/gi, "");
  out = out.replace(/javascript:/gi, "");

  return out;
}

function buildRenderedHtmlFromTsx(tsx: string) {
  const block = extractReturnBlock(tsx);
  if (!block) return { ok: false as const, reason: "Could not find a return(...) block to render." };

  const html = sanitizeHtml(jsxToHtmlBestEffort(block));
  if (!html) return { ok: false as const, reason: "The return block was empty after conversion." };

  return { ok: true as const, html };
}

export default async function PreviewCatchAllPage({
  params,
}: {
  params: { projectId: string; slug?: string[] };
}) {
  const userId = getCurrentUserId();
  const { projectId, slug } = params;

  const project = await kvJsonGet<ProjectRecord>(projectKey(userId, projectId));
  const files = project?.files ?? [];

  const { target, found } = pickGeneratedPage(files, slug);

  if (!project) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Preview</h1>
        <p>
          Project not found in KV for:
          <br />
          <code>{projectId}</code>
        </p>
      </main>
    );
  }

  const renderResult = found ? buildRenderedHtmlFromTsx(found.content) : null;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Preview</h1>

      {/* Navigation */}
      <PreviewNav projectId={projectId} />

      <p style={{ marginBottom: 10 }}>
        <strong>Showing:</strong>
        <br />
        <code>{target}</code>
      </p>

      {!found ? (
        <>
          <p style={{ marginBottom: 16 }}>
            Could not find a generated page for this route.
          </p>

          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Files in project</h2>
          <ul>
            {files.map((f) => (
              <li key={f.path}>
                <code>{f.path}</code>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {/* ✅ Visual preview */}
          <h2 style={{ fontSize: 16, margin: "12px 0 8px" }}>Rendered Preview</h2>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 12,
              padding: 16,
              background: "white",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              marginBottom: 16,
            }}
          >
            {renderResult?.ok ? (
              <div
                // Best-effort render from TSX return block
                dangerouslySetInnerHTML={{ __html: renderResult.html }}
              />
            ) : (
              <div style={{ opacity: 0.8 }}>
                <p style={{ marginTop: 0 }}>
                  This page is too complex to auto-render in visual mode yet.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Reason: <code>{renderResult?.reason ?? "Unknown"}</code>
                </p>
              </div>
            )}
          </div>

          {/* Source */}
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Source</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: 12,
              borderRadius: 8,
              background: "rgba(0,0,0,0.06)",
              overflowX: "auto",
            }}
          >
            {found.content}
          </pre>
        </>
      )}

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        Updated: <code>{project.updatedAt}</code>
      </div>
    </main>
  );
}
