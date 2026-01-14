import type { Metadata } from "next";
import PublicRenderer from "./PublicRenderer";
import { getPublishedMetadata } from "./publishedSeo";

type PageProps = {
  params: { projectId: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  return getPublishedMetadata({ projectId: params.projectId, pageSlug: "" });
}

export default function PublishedHomePage({ params }: PageProps) {
  return <PublicRenderer projectId={params.projectId} />;
}
