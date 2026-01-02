import { getSeoPageBySlug } from "../../../lib/seoKV";

export default async function SeoPage({
  params,
}: {
  params: { projectId: string; slug: string };
}) {
  const page = await getSeoPageBySlug(params.projectId, params.slug);

  if (!page) return null;

  return (
    <main style={{ padding: 16 }}>
      <h1>{page.h1}</h1>

      {page.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 16 }}>
          <h2>{s.heading}</h2>
          <p>{s.content}</p>
        </section>
      ))}
    </main>
  );
}
