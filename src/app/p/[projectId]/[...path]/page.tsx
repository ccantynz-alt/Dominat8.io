import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicRenderer from "../PublicRenderer";
import { getPublishedMetadata } from "../publishedSeo";

type PageProps = {
  params: { projectId: string; path?: string[] };
};

function normalizeSlug(path?: string[]) {
  const slug =
    Array.isArray(path) && path.length > 0 ? String(path[0] || "") : "";
  return slug.trim().toLowerCase();
}

function isAllowedPublishedSlug(slug: string) {
  const allowed = new Set(["about", "pricing", "faq", "contact"]);
  return allowed.has(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = normalizeSlug(params.path);
  return await getPublishedMetadata({ projectId: params.projectId, pageSlug: slug });
}

export default function PublishedCatchAllPage({ params }: PageProps) {
  const slug = normalizeSlug(params.path);

  if (!isAllowedPublishedSlug(slug)) {
    notFound();
  }

  return <PublicRenderer projectId={params.projectId} pathSlug={slug} />;
}

