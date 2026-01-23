// src/app/p/[projectId]/faq/page.tsx
import { redirect } from "next/navigation";

export default function PublishedFaqPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/p/${params.projectId}`);
}
