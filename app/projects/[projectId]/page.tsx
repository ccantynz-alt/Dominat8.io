import StatusBadge from "./StatusBadge";
import GeneratePanel from "./GeneratePanel";
import PublishButton from "./PublishButton";
import VersionsPanel from "./VersionsPanel";
import RunDemoPanel from "./RunDemoPanel";
import DomainPanel from "./DomainPanel";
import AdminActionsPanel from "./AdminActionsPanel";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: 6 }}>Project</h1>
          <div style={{ opacity: 0.75 }}>{projectId}</div>
        </div>

        <div style={{ alignSelf: "center" }}>
          <StatusBadge projectId={projectId} />
        </div>
      </div>

      <GeneratePanel projectId={projectId} />
      <PublishButton projectId={projectId} />
      <VersionsPanel projectId={projectId} />

      <div style={{ marginTop: 24 }}>
        <DomainPanel projectId={projectId} />
      </div>

      <div style={{ marginTop: 24 }}>
        <RunDemoPanel projectId={projectId} />
      </div>

      <AdminActionsPanel projectId={projectId} />
    </main>
  );
}
