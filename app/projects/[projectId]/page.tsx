import { kv } from "@vercel/kv";
import DomainPanel from "./DomainPanel";
import Link from "next/link";

export const runtime = "nodejs";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  // Load project data (safe even if partial)
  const project = await kv.hgetall<any>(`project:${projectId}`);

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Project: {project?.name || projectId}
      </h1>

      <p style={{ opacity: 0.7 }}>
        ID: <code>{projectId}</code>
      </p>

      <div style={{ marginTop: 16 }}>
        <Link href="/projects">← Back to projects</Link>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {/* ===== DOMAIN VERIFICATION PANEL ===== */}
      <DomainPanel projectId={projectId} />

      <hr style={{ margin: "24px 0" }} />

      {/* ===== STATUS INFO ===== */}
      <h3>Status</h3>
      <ul>
        <li>
          Published:{" "}
          <strong>{project?.published ? "Yes" : "No"}</strong>
        </li>
        <li>
          Domain:{" "}
          <strong>{project?.domain || "None"}</strong>
        </li>
        <li>
          Domain verified:{" "}
          <strong>
            {project?.domainVerified === "true" ? "Yes" : "No"}
          </strong>
        </li>
      </ul>
    </main>
  );
}
