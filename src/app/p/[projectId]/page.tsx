import { Metadata } from "next";
import PublicRenderer from "./PublicRenderer";

type PageProps = {
  params: { projectId: string };
};

export const metadata: Metadata = {
  title: "Home",
  description: "Published website",
};

export default function PublishedHomePage({ params }: PageProps) {
  return (
    <PublicRenderer
      projectId={params.projectId}
      page="home"
    />
  );
}
