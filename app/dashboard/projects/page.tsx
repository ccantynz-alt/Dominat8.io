// app/dashboard/projects/page.tsx
import "server-only";
import Link from "next/link";
import { kv, kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

export default async function ProjectsIndexPage() {
  // ✅ NEVER throw in production debugging — render the error instead.
  try {
    const userId = await getCurrentUserId();

    // We store project IDs in a sorted set. If it doesn't exist, zrange returns [].
    const idsRaw = await kv.zrange(indexKey(userId), 0, -1);

    const ids: string[] = Array.isArray(idsRaw)
      ? idsRaw.map(String).filter(Boolean)
      : [];

    // Load each project by id
    const projects: Project[] = [];

    for (const id of ids) {
      const p = await kvJsonGet<Project>(projectKey(userId, id));
      if (p && p.id && p.name) projects.push(p);
    }

    // Optional: show newest first if createdAt exists
    projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

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
  } catch (e: any) {
    const message = e?.message ? String(e.message) : String(e);

    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ marginTop: 0 }}>Projects</h1>
        <p>
          This is the real server error (rendered safely, not hidden behind a digest).
        </p>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <strong>Error</strong>
          {"\n"}
          {message}
        </div>

        <div style={{ marginTop: 16 }}>
          <Link href="/dashboard" style={{ textDecoration: "underline" }}>
            Back to dashboard
          </Link>
        </div>

        <p style={{ marginTop: 16 }}>
          Next: open <code>/api/projects</code> and paste what it returns.
        </p>
      </div>
    );
  }
}
