// app/dashboard/projects/page.tsx
import "server-only";
import { headers } from "next/headers";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

function getBaseUrl(): string {
  const h = headers();

  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "";

  if (host) return `${proto}://${host}`;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

async function safeFetchJson(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  const text = await res.text();

  let json: any = null;
  let jsonError: string | null = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (e: any) {
    jsonError = e?.message || "JSON parse error";
  }

  return {
    ok: res.ok,
    status: res.status,
    text,
    json,
    jsonError,
  };
}

export default async function ProjectsIndexPage() {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/projects`;

  const resp = await safeFetchJson(url);

  // ✅ Render debug info instead of throwing (production-safe)
  if (!resp.ok || resp.jsonError) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ marginTop: 0 }}>Projects</h1>

        <p style={{ marginTop: 8 }}>
          This page is showing the real server error details (not the hidden digest).
        </p>

        <div style={{ marginTop: 16 }}>
          <Link href="/dashboard" style={{ textDecoration: "underline" }}>
            Back to dashboard
          </Link>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <strong>Fetch URL</strong>
          {"\n"}
          {url}
          {"\n\n"}
          <strong>Status</strong>
          {"\n"}
          {resp.status}
          {"\n\n"}
          <strong>JSON parse error</strong>
          {"\n"}
          {resp.jsonError ?? "(none)"}
          {"\n\n"}
          <strong>Body (first 2000 chars)</strong>
          {"\n"}
          {resp.text.slice(0, 2000) || "(empty)"}
        </div>

        <p style={{ marginTop: 16 }}>
          Next: open <code>/api/projects</code> directly and paste what it shows.
        </p>
      </div>
    );
  }

  const projects: Project[] = Array.isArray(resp.json?.projects) ? resp.json.projects : [];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Back to dashboard
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul>
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
