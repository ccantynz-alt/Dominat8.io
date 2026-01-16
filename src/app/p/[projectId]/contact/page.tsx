// src/app/p/[projectId]/contact/page.tsx
import { redirect } from "next/navigation";

export default function PublishedContactPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/p/${params.projectId}`);
}

