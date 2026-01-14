import AgentsClient from "./AgentsClient";

type Props = {
  params: { projectId: string };
};

export default function AgentsPage({ params }: Props) {
  return <AgentsClient projectId={params.projectId} />;
}
