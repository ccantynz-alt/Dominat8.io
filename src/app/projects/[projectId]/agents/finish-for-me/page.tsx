// src/app/projects/[projectId]/agents/finish-for-me/page.tsx
import FinishForMeClient from "./FinishForMeClient";

export default function FinishForMePage({ params }: { params: { projectId: string } }) {
  return <FinishForMeClient projectId={params.projectId} />;
}

