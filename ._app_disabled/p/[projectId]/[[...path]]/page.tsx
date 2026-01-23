// app/p/[projectId]/[[...path]]/page.tsx
import Link from "next/link";

export default function PublishedCatchAllPage({
  params,
}: {
  params: { projectId: string; path?: string[] };
}) {
  const projectId = params.projectId;
  const path = Array.isArray(params.path) ? params.path : [];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Published Site ✅</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Project: <code>{projectId}</code>
      </p>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Catch-all path: <code>[{path.join(", ")}]</code>
      </p>

      <hr style={{ margin: "16px 0" }} />

      <p style={{ margin: 0 }}>
        If you see this page, the published catch-all route is working.
      </p>

      <p style={{ marginTop: 12 }}>
        <Link href={`/p/${projectId}`}>Go to canonical /p/{projectId}</Link>
      </p>
    </main>
  );
}

