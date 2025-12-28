// app/preview/[projectId]/page.tsx
import PreviewClient from "./preview-client";

export const dynamic = "force-dynamic";

export default function PreviewPage({ params }: { params: { projectId: string } }) {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
        Live Preview
      </h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 12 }}>
        Project: <span style={{ fontFamily: "ui-monospace, monospace" }}>{params.projectId}</span>
      </p>

      <PreviewClient projectId={params.projectId} />
    </main>
  );
}
