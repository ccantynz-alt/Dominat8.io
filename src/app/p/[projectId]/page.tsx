export const runtime = "nodejs";

type PageProps = {
  params: { projectId: string };
};

export default function PublishedProjectPage({ params }: PageProps) {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Published Site ✅</h1>
      <p>
        Project: <b>{params.projectId}</b>
      </p>
      <p>If you see this page, /p/[projectId] is not redirecting.</p>
    </main>
  );
}
