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
  // 1) Prefer request headers (works behind Vercel proxy)
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "";

  if (host) {
    return `${proto}://${host}`;
  }

  // 2) Vercel environment fallback (very reliable in production)
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    // VERCEL_URL is usually like "my-app.vercel.app" (no protocol)
    return `https://${vercelUrl}`;
  }

  // 3) Local fallback
  return "http://localhost:3000";
}

async function fetchProjects(baseUrl: string) {
  const url = `${baseUrl}/api/projects`;

  const res = await fetch(url, {
    cache: "no-store",
    // next: { revalidate: 0 }, // optional
    headers: {
      // Ensure edge/proxy caches don't do anything weird
      "accept": "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      [
        `Failed to load /api/projects`,
        `URL: ${url}`,
        `Status: ${res.status}`,
        `Body: ${text.slice(0, 2000)}`,
      ].join("\n")
    );
  }

  // Parse JSON safely
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      [
        `Expected JSON from /api/projects but got non-JSON`,
        `URL: ${url}`,
        `Body: ${text.slice(0, 2000)}`,
      ].join("\n")
    );
  }

  return json;
}

export default async function ProjectsIndexPage() {
  const baseUrl = getBaseUrl();
  const data = await fetchProjects(baseUrl);

  const projects: Project[] = Array.isArray(data?.projects) ? data.projects : [];

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
                <Link href={`/dashboard/projects/${p.id}`}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
