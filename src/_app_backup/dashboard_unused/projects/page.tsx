import Link from "next/link";

async function getProjects() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.projects ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Projects</h1>

        <Link
          href="/dashboard/projects/new"
          style={{
            padding: "8px 14px",
            background: "#000",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + New Project
        </Link>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {projects.length === 0 && (
          <div
            style={{
              padding: 24,
              border: "1px dashed #ccc",
              borderRadius: 12,
              color: "#777",
            }}
          >
            No projects yet.
          </div>
        )}

        {projects.map((p: any) => (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            style={{
              padding: 16,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              textDecoration: "none",
              color: "#000",
            }}
          >
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
