// app/dashboard/projects/page.tsx
import "server-only";
import Link from "next/link";
import { listProjects } from "@/app/lib/store";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import CreateProjectForm from "./create-project-form";

export default async function ProjectsPage() {
  const userId = await getCurrentUserId();
  const projects = await listProjects(userId);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <p style={{ marginTop: 6, color: "#666" }}>
            Create a project, then run the website builder inside it.
          </p>
        </div>
        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Back
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <CreateProjectForm />
      </div>

      <div style={{ marginTop: 18 }}>
        {projects.length === 0 ? (
          <div style={{ padding: 14, border: "1px solid #e5e5e5", borderRadius: 10 }}>
            <strong>No projects yet.</strong>
            <div style={{ marginTop: 6, color: "#666" }}>
              Create your first project above.
            </div>
          </div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {projects.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <Link href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "underline" }}>
                  {p.name}
                </Link>
                <span style={{ marginLeft: 10, color: "#777", fontSize: 12 }}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
