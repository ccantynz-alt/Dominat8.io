import { Metadata } from "next";
import CatchAllPublishedPage from "../[...path]/page";

type Props = {
  params: { projectId: string };
};

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact this website",
};

export default function PublishedContactPage({ params }: Props) {
  return (
    <CatchAllPublishedPage
      params={{ projectId: params.projectId, path: ["contact"] }}
    />
  );
}
