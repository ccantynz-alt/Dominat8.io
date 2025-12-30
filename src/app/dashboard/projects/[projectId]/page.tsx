import Link from "next/link";
import RunCreator from "./RunCreator";

// Relative import avoids alias/root confusion
import { getProject, listRuns } from "../../../lib/store";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const project = await getProject(projectId);

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Project not found
        </h1>
        <Link href="/dashboard/projects">Back to projects</Link>
      </div>
    );
  }

  const runs = await listRuns(projectId);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard/projects">← Back</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{project.name}</h1>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16, color: "#666" }}>
        <div>Project ID: {project.id}</div>
        <div>Created: {project.createdAt}</div>
      </div>

      <RunCreator projectId={projectId} />

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Runs</h2>

        {runs.length === 0 ? (
          <div style={{ color: "#666" }}>No runs yet.</div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {runs.map((r) => (
              <li key={r.id} style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace" }}>{r.id}</span>{" "}
                <span style={{ color: "#666" }}>({r.status})</span>
                {r.prompt ? (
                  <div style={{ color: "#444", marginTop: 4 }}>{r.prompt}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
