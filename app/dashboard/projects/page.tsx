// app/dashboard/projects/page.tsx
import Link from "next/link";
import { listProjects } from "@/app/lib/store";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Projects</h1>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard">Dashboard</Link>
      </div>

      <div style={{ marginTop: 16 }}>
        {projects.length === 0 ? (
          <div style={{ color: "#666" }}>No projects yet.</div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {projects.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>{" "}
                <span style={{ color: "#666", marginLeft: 8 }}>
                  ({p.createdAt})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
