import PublishedProjectPage from "../page";

export const runtime = "nodejs";

type Props = {
  params: { projectId: string; path?: string[] };
};

export default function PublishedCatchAll({ params }: Props) {
  return <PublishedProjectPage params={{ projectId: params.projectId }} />;
}
