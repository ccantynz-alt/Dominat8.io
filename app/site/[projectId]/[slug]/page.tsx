import { getSeoPageBySlug } from "../../../lib/seoPagesKV";

export default async function SeoPage({
  params,
}: {
  params: { projectId: string; slug: string };
}) {
  const page = await getSeoPageBySlug(params.projectId, params.slug);

  if (!page) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Not found</h1>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, maxWidth: 900 }}>
      <h1>{page.h1}</h1>
      <p style={{ opacity: 0.8 }}>{page.description}</p>

      {page.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 18 }}>
          <h2>{s.heading}</h2>
          <p>{s.content}</p>
        </section>
      ))}
    </main>
  );
}
