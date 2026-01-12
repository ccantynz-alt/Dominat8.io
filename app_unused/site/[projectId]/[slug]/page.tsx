import React from "react";

type PageSection = {
  heading: string;
  content: string;
};

type SitePage = {
  title: string;
  description?: string;
  sections: PageSection[];
};

export default async function Page({
  params,
}: {
  params: { projectId: string; slug: string };
}) {
  // NOTE:
  // This is a stub page renderer to satisfy TypeScript strict mode.
  // Replace the "page" data with real fetch logic later.
  const page: SitePage = {
    title: `Page: ${params.slug}`,
    description: `Project: ${params.projectId}`,
    sections: [],
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>{page.title}</h1>

      {page.description ? <p style={{ opacity: 0.8 }}>{page.description}</p> : null}

      {page.sections.map((s: PageSection, i: number) => (
        <section key={i} style={{ marginTop: 18 }}>
          <h2>{s.heading}</h2>
          <p>{s.content}</p>
        </section>
      ))}
    </main>
  );
}
