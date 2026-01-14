import { Metadata } from "next";
import CatchAllPublishedPage from "../[...path]/page";

type PageProps = {
  params: { projectId: string };
};

export const metadata: Metadata = {
  title: "About",
  description: "About this website",
};

export default function PublishedAboutPage({ params }: PageProps) {
  // Reuse the existing published routing logic:
  // /p/[projectId]/about  -> behaves like /p/[projectId]/about via catch-all
  return (
    <CatchAllPublishedPage
      params={{ projectId: params.projectId, path: ["about"] }}
    />
  );
}

