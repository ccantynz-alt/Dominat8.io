// src/app/projects/[projectId]/agents/seo/page.tsx

export const dynamic = "force-dynamic";

type PageProps = {
  params: { projectId: string };
};

export default async function Page({ params }: PageProps) {
  const projectId = params?.projectId ?? "";

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        SEO Agent
      </h1>

      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Project: <code>{projectId}</code>
      </p>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Why the build failed
        </h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          This page used a re-export that pointed to a non-existent path
          (it effectively referenced <code>src/src/app/...</code>). This file now
          contains a real page so the build can proceed.
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Next step
        </h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Re-run the build. Once routing is cleaned (no <code>app/api</code> /
          <code>src/app/api</code>), we can wire this UI to the Pages API SEO
          agent endpoint.
        </p>
      </div>
    </main>
  );
}
