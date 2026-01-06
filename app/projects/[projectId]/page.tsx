import PublishButton from "./PublishButton";
import RunDemoPanel from "./RunDemoPanel";
import DomainPanel from "./DomainPanel";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Project</h1>
      <div style={{ opacity: 0.75, marginBottom: 16 }}>{projectId}</div>

      <PublishButton projectId={projectId} />

      <div style={{ marginTop: 24 }}>
        <RunDemoPanel projectId={projectId} />
      </div>

      <div style={{ marginTop: 24 }}>
        <DomainPanel projectId={projectId} />
      </div>
    </main>
  );
}
