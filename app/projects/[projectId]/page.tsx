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
  const projectId = params.projectId;

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

      {/* ✅ Domain onboarding (Phase 1: store + instructions) */}
      <DomainPanel projectId={projectId} />

      {/* ✅ Demo run generator */}
      <RunDemoPanel projectId={projectId} />

      {/* ✅ Publish latest run */}
      <PublishPanel projectId={projectId} />

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Public URL</h2>
        <p style={{ opacity: 0.8 }}>
          After publishing, your site is available at: <a href={`/p/${projectId}`}>{`/p/${projectId}`}</a>
        </p>
      </div>
    </main>
  );
}
