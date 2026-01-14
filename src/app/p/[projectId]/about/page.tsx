import { Metadata } from "next";
import CatchAllPublishedPage from "../[...path]/page";

type Props = {
  params: { projectId: string };
};

export const metadata: Metadata = {
  title: "About",
  description: "About this website",
};

export default function PublishedAboutPage({ params }: Props) {
  return (
    <CatchAllPublishedPage
      params={{ projectId: params.projectId, path: ["about"] }}
    />
  );
}
