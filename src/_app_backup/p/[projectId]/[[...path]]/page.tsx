export const runtime = "nodejs";

type Props = {
  params: { projectId: string; path?: string[] };
};

export default function PublishedCatchAll({ params }: Props) {
  // IMPORTANT: Never redirect from here.
  // Treat any extra path as "show the published homepage".
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Published Site ✅</h1>
      <p>
        Project: <b>{params.projectId}</b>
      </p>
      <p>Catch-all path:</p>
      <pre style={{ opacity: 0.8 }}>
        {JSON.stringify(params.path ?? [], null, 2)}
      </pre>
      <p>If you see this page, the redirect loop is fixed.</p>
      <p style={{ marginTop: 16, opacity: 0.7 }}>
        Next step: swap this for the polished template.
      </p>
    </main>
  );
}
