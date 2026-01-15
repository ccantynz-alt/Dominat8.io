export default function PublicProjectPage({
  params,
}: {
  params: { projectId: string; path?: string[] };
}) {
  const slug = params.path?.join("/") ?? "";
  const label = slug === "" ? "home" : slug;

  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
        Public Project Page
      </h1>

      <p style={{ marginTop: 10, marginBottom: 0 }}>
        Project ID: <code>{params.projectId}</code>
      </p>

      <p style={{ marginTop: 10, marginBottom: 0 }}>
        Page: <code>{label}</code>
      </p>

      <div style={{ marginTop: 18, lineHeight: 1.8 }}>
        <div>
          <a href={`/p/${params.projectId}`}>Home</a>
        </div>
        <div>
          <a href={`/p/${params.projectId}/about`}>About</a>
        </div>
        <div>
          <a href={`/p/${params.projectId}/pricing`}>Pricing</a>
        </div>
        <div>
          <a href={`/p/${params.projectId}/faq`}>FAQ</a>
        </div>
        <div>
          <a href={`/p/${params.projectId}/contact`}>Contact</a>
        </div>
      </div>
    </main>
  );
}
