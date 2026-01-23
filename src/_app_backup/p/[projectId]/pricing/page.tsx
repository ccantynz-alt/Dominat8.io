// src/app/p/[projectId]/pricing/page.tsx
import { redirect } from "next/navigation";

export default function PublishedPricingPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/p/${params.projectId}`);
}
