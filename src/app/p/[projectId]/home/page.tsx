// src/app/p/[projectId]/home/page.tsx
import { redirect } from "next/navigation";

export default function PublishedHomePage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/p/${params.projectId}`);
}

