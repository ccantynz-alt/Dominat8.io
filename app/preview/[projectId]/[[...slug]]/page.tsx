// app/preview/[projectId]/[[...slug]]/page.tsx
import React from "react";

type GenFile = { path: string; content: string };

async function getProjectFiles(projectId: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "";

  // If base is empty, relative fetch will still work in most Next setups,
  // but we prefer absolute when available.
  const url = base
    ? `${base}/api/projects/${projectId}/files`
    : `/api/projects/${projectId}/files`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load project files (${res.status})`);
  }
  return (await res.json()) as {
    ok: boolean;
    projectId: string;
    files: GenFile[];
  };
}

function pickGeneratedPage(files: GenFile[], slug: string[]) {
  // slug [] => homepage => app/generated/page.tsx
  // slug ["about"] => app/generated/about/page.tsx
  // slug ["pricing"] => app/generated/pricing/page.tsx
  // slug ["contact"] => app/generated/contact/page.tsx
  const clean = (slug || []).filter(Boolean);

  const target =
    clean.length === 0
      ? "app/generated/page.tsx"
      : `app/generated/${clean.join("/")}/page.tsx`;

  const found = files.find((f) => f.path.replace(/^\/+/, "") === target);

  return { target, found };
}

export default async function PreviewCatchAllPage({
  params,
}: {
  params: Promise<{ projectId: string; slug?: string[] }>;
}) {
  const { projectId, slug } = await params;

  const data = await getProjectFiles(projectId);
  const files = data.files || [];

  const { target, found } = pickGeneratedPage(files, slug ?? []);

  // Very simple "best effort" preview:
  // - We show the file path
  // - We show the source content
  // (Your existing /preview page likely does fancier rendering;
  // this solves the routing first, reliably.)
  if (!found) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Preview</h1>
        <p style={{ marginBottom: 16 }}>
          Could not find a generated page for:
          <br />
          <code>{target}</code>
        </p>

        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Files in project</h2>
        <ul>
          {files.map((f) => (
            <li key={f.path}>
              <code>{f.path}</code>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Preview</h1>

      <p style={{ marginBottom: 16 }}>
        Showing:
        <br />
        <code>{target}</code>
      </p>

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
    </main>
  );
}
