import { kvJsonGet } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export default async function PreviewPage({
  params,
}: {
  params: { projectId: string; slug?: string[] };
}) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  const project = await kvJsonGet(`projects:${userId}:${projectId}`);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Preview</h1>

      <pre
        style={{
          marginTop: 16,
          padding: 16,
          background: "#111",
          color: "#0f0",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {JSON.stringify(project, null, 2)}
      </pre>
    </div>
  );
}
