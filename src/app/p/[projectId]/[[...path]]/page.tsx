import PublishedProjectPage from "../page";

export const runtime = "nodejs";

type Props = {
  params: { projectId: string; path?: string[] };
};

export default function PublishedCatchAll({ params }: Props) {
  // IMPORTANT:
  // Do NOT redirect. Just render the main published page.
  return <PublishedProjectPage params={{ projectId: params.projectId }} />;
}
