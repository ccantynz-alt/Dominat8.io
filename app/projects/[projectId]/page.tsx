// app/projects/[projectId]/page.tsx
import { kv } from "@vercel/kv";
import PublishPanel from "./PublishPanel";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  // Load project (optional, but useful for display)
  const project = (await kv.hgetall(`project:${projectId}`)) as any;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Project</h1>

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

      {/* ✅ Publish button panel */}
      <PublishPanel projectId={projectId} />

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Next</h2>
        <p style={{ opacity: 0.8 }}>
          Next we’ll connect Runs → Generated output → Publish (so it publishes the latest run, not the global demo).
        </p>
      </div>
    </main>
  );
}
