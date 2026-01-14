import type { Metadata } from "next";
import CatchAllPublishedPage from "../[...path]/page";
import { getPublishedMetadata } from "../publishedSeo";

type Props = {
  params: { projectId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return await getPublishedMetadata({ projectId: params.projectId, pageSlug: "faq" });
}

export default function PublishedFaqPage({ params }: Props) {
  return (
    <CatchAllPublishedPage
      params={{ projectId: params.projectId, path: ["faq"] }}
    />
  );
}
