import AgentsClient from "./AgentsClient";

export const dynamic = "force-dynamic";

export default function AgentsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Agents
      </h1>

      <p style={{ marginBottom: 16, opacity: 0.85 }}>
        Project: <code>{params.projectId}</code>
      </p>

      <AgentsClient projectId={params.projectId} />
    </main>
  );
}
