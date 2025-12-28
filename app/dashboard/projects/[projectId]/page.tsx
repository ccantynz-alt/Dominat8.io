import { notFound } from "next/navigation";

type Project = {
  id?: string;
  projectId?: string;
  name?: string;
};

async function getProject(projectId: string): Promise<Project | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (!json?.ok || !Array.isArray(json.projects)) return null;

  return (
    json.projects.find(
      (p: Project) => p.id === projectId || p.projectId === projectId
    ) ?? null
  );
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = await getProject(params.projectId);

  if (!project) {
    notFound();
  }

  const id = project.id || project.projectId;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginTop: 0 }}>
        {project.name || "Untitled Project"}
      </h1>

      <div style={{ opacity: 0.7, marginBottom: 16 }}>
        Project ID: <code>{id}</code>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <strong>✅ Project loaded successfully.</strong>
        <div style={{ marginTop: 8 }}>
          You are now inside the project workspace.
        </div>
      </div>
    </div>
  );
}
