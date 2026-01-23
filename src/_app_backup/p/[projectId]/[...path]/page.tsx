// src/app/p/[projectId]/[...path]/page.tsx
import { redirect } from "next/navigation";

export default function PublicCatchAll({
  params,
}: {
  params: { projectId: string; path: string[] };
}) {
  redirect(`/p/${params.projectId}`);
}
