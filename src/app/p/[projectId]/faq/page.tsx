import { Metadata } from "next";
import CatchAllPublishedPage from "../[...path]/page";

type Props = {
  params: { projectId: string };
};

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions",
};

export default function PublishedFaqPage({ params }: Props) {
  return (
    <CatchAllPublishedPage
      params={{ projectId: params.projectId, path: ["faq"] }}
    />
  );
}
