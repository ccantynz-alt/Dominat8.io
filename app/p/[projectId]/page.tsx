// app/p/[projectId]/page.tsx
import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

async function getGeneratedHtml(projectId: string): Promise<{ html: string | null; keyTried: string[]; keyUsed: string | null }> {
  const keys = [
    `generated:project:${projectId}:latest`,
    `generated:project:${projectId}`,
    `generated:${projectId}:latest`,
    `generated:${projectId}`,
    `generated:latest`, // <-- common in your earlier logs
  ];

  for (const key of keys) {
    const v = await kv.get<any>(key);
    if (typeof v === "string" && v.trim().length > 0) {
      return { html: v, keyTried: keys, keyUsed: key };
    }
  }

  return { html: null, keyTried: keys, keyUsed: null };
}

export default async function PublicProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const { html } = await getGeneratedHtml(projectId);

  if (!html) notFound();

  return (
    <html lang="en">
      <head />
      <body dangerouslySetInnerHTML={{ __html: html }} />
    </html>
  );
}
