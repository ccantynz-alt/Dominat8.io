import Link from "next/link";
import { getProject, listRuns } from "../../../lib/store";

export const runtime = "nodejs";

export default async function ProjectDetailPage({
  params
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const project: any = await getProject(projectId);
  const runs: any[] = await listRuns(projectId);

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <Link href="/dashboard/projects">← Back</Link>
        <h1 style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>
          Project not found
        </h1>
        <p style={{ marginTop: 8, color: "#666" }}>
          No project exists for id: <code>{projectId}</code>
        </p>
      </div>
    );
  }

  const name =
    typeof project?.name === "string" && project.name.trim()
      ? project.name
      : "Untitled Project";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard/projects">← Back</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{name}</h1>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16, color: "#666" }}>
        Project ID: <code>{projectId}</code>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Runs</div>

        {runs.length === 0 ? (
          <div style={{ color: "#666" }}>No runs yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {runs.map((r) => (
              <li key={String(r?.id ?? Math.random())}>
                <code>{String(r?.id ?? "run")}</code> —{" "}
                <span>{String(r?.status ?? "queued")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
