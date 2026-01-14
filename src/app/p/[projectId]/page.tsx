// src/app/p/[projectId]/page.tsx

import type { Metadata } from "next";
import { getPublishedProject } from "@/app/lib/projectPublishStore";

export const metadata: Metadata = {
  title: "Published Site",
  description: "Published project page.",
};

export default async function Page({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const published = await getPublishedProject(projectId);

  if (!published) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          This site isn’t published yet
        </h1>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          The project exists, but it hasn’t been published. Go back to the builder and click Publish.
        </p>
        <a href="/projects" style={{ fontWeight: 900 }}>
          Back to Projects
        </a>
      </div>
    );
  }

  const sections = published.content.sections || [];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 14 }}>
        <div><b>projectId:</b> {projectId}</div>
        <div><b>templateId:</b> {published.templateId ?? "null"}</div>
        <div><b>publishedAt:</b> {published.publishedAt}</div>
      </div>

      {sections.map((sec) => (
        <section
          key={sec.id}
          style={{
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 900, opacity: 0.7, marginBottom: 8 }}>
            {sec.type.toUpperCase()}
          </div>

          {sec.heading ? (
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
              {sec.heading}
            </h2>
          ) : null}

          {sec.subheading ? (
            <p style={{ marginTop: 8, opacity: 0.85 }}>
              {sec.subheading}
            </p>
          ) : null}

          {sec.items && sec.items.length > 0 ? (
            <ul style={{ marginTop: 10 }}>
              {sec.items.map((it, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {it}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
