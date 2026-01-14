// src/app/p/[projectId]/page.tsx

import type { Metadata } from "next";
import { getPublishedProject } from "@/app/lib/projectPublishStore";
import PublicRenderer from "./PublicRenderer";

export async function generateMetadata(
  { params }: { params: { projectId: string } }
): Promise<Metadata> {
  const published = await getPublishedProject(params.projectId);

  if (!published) {
    return {
      title: "Not published yet",
      description: "This site hasn’t been published yet.",
      robots: { index: false, follow: false },
    };
  }

  const hero = published.content.sections.find((s) => s.type === "hero");
  const title = (hero?.heading || "Published Site").slice(0, 60);
  const description = (hero?.subheading || "A published project page.").slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

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

  return <PublicRenderer sections={published.content.sections || []} />;
}
