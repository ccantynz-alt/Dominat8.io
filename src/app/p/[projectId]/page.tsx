import { loadPublishedSiteSpec } from "@/app/lib/publishedSpecStore";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { projectId: string };
};

export default async function PublicProjectPage({ params }: PageProps) {
  const projectId = params?.projectId;

  if (!projectId) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Missing projectId</h1>
      </main>
    );
  }

  const spec: any = await loadPublishedSiteSpec(projectId);

  if (!spec) {
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>This site isn’t published yet</h1>
        <p style={{ marginTop: 12, color: "#555" }}>
          The project exists, but it hasn’t been published. Go back to the builder and click Publish.
        </p>
      </main>
    );
  }

  const brandName = spec?.brand?.name ?? "Your Site";
  const tagline = spec?.brand?.tagline ?? "Published site";
  const home = Array.isArray(spec?.pages) ? spec.pages.find((p: any) => p?.id === "home") : null;
  const sections = Array.isArray(home?.sections) ? home.sections : [];

  const hero = sections.find((s: any) => s?.type === "hero") ?? null;
  const features = sections.find((s: any) => s?.type === "features") ?? null;

  const headline = hero?.headline ?? `${brandName}`;
  const subheadline = hero?.subheadline ?? tagline;
  const ctaText = hero?.ctaText ?? "Get started";
  const ctaHref = hero?.ctaHref ?? "/start";

  const featureItems: Array<{ title: string; description: string }> =
    Array.isArray(features?.items) ? features.items : [];

  return (
    <main style={{ minHeight: "100vh", background: "white", fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ padding: "28px 24px", borderBottom: "1px solid #eee" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div style={{ fontWeight: 800 }}>{brandName}</div>
          <nav style={{ display: "flex", gap: 14, fontSize: 14 }}>
            <a href={ctaHref} style={{ textDecoration: "underline" }}>
              Start
            </a>
          </nav>
        </div>
      </header>

      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ fontSize: 46, lineHeight: 1.1, fontWeight: 900, margin: 0 }}>{headline}</h1>
          <p style={{ marginTop: 16, fontSize: 18, color: "#444", maxWidth: 720 }}>{subheadline}</p>

          <div style={{ marginTop: 26 }}>
            <a
              href={ctaHref}
              style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 24px 72px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Features</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {(featureItems.length ? featureItems : [
              { title: "Fast setup", description: "Generate a complete site in minutes." },
              { title: "Automation-first", description: "Reduce manual work with smart flows." },
              { title: "Publish instantly", description: "Go live with one click." },
            ]).map((f, idx) => (
              <div key={idx} style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 800 }}>{f.title}</div>
                <div style={{ marginTop: 6, color: "#555" }}>{f.description}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, fontSize: 12, color: "#777" }}>
            Project: <span style={{ fontFamily: "monospace" }}>{projectId}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
