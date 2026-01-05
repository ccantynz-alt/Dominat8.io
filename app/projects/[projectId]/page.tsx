// app/projects/[projectId]/page.tsx
import { kv } from "@vercel/kv";
import PublishPanel from "./PublishPanel";
import RunDemoPanel from "./RunDemoPanel";
import DomainPanel from "./DomainPanel";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const rawProjectId = params.projectId || "";
  const projectId = decodeURIComponent(rawProjectId);

  // ✅ Guard: if someone hits /projects/[projectId] by mistake, show a helpful page
  if (projectId.includes("[") || projectId.includes("]") || projectId === "projectId") {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Invalid Project Link</h1>
        <p style={{ opacity: 0.85 }}>
          You opened a placeholder URL instead of a real project. Go back to Projects and click a real project card.
        </p>
        <p>
          <a href="/projects">← Back to Projects</a>
        </p>
      </main>
    );
  }

  const project = (await kv.hgetall(`project:${projectId}`)) as any;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Project</h1>

      <div style={{ marginBottom: 16, opacity: 0.85 }}>
        <div>
          <b>Project ID:</b> {projectId}
        </div>
        {project?.name ? (
          <div>
            <b>Name:</b> {String(project.name)}
          </div>
        ) : null}
        {project?.templateId ? (
          <div>
            <b>Template:</b> {String(project.templateId)}
          </div>
        ) : null}
      </div>

      <DomainPanel projectId={projectId} />
      <RunDemoPanel projectId={projectId} />
      <PublishPanel projectId={projectId} />

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Public URL</h2>
        <p style={{ opacity: 0.8 }}>
          After publishing, your site is available at:{" "}
          <a href={`/p/${encodeURIComponent(projectId)}`}>{`/p/${projectId}`}</a>
        </p>
      </div>
    </main>
  );
}
