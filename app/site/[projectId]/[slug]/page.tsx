import React from "react";

type SiteSection = {
  heading: string;
  content: string;
};

type SitePage = {
  title: string;
  description: string;
  sections: SiteSection[];
};

export default async function SitePageBySlug() {
  // This is a placeholder example page.
  // Replace with real data loading if/when you wire up site pages.
  const page: SitePage = {
    title: "Page",
    description: "This is a placeholder page.",
    sections: [
      { heading: "Section 1", content: "Content for section 1." },
      { heading: "Section 2", content: "Content for section 2." },
    ],
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>{page.title}</h1>
      <p style={{ opacity: 0.8 }}>{page.description}</p>

      {page.sections.map((s: SiteSection, i: number) => (
        <section key={i} style={{ marginTop: 18 }}>
          <h2>{s.heading}</h2>
          <p>{s.content}</p>
        </section>
      ))}
    </main>
  );
}
