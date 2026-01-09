// app/p/[projectId]/page.tsx
import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export default async function PublicProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  // This is where your generator has been saving HTML in previous builds.
  // If you used a different key, we can adjust it later.
  const html =
    (await kv.get<string>(`generated:project:${projectId}:latest`)) ??
    (await kv.get<string>(`generated:${projectId}:latest`)) ??
    null;

  if (!html || typeof html !== "string") {
    // Show a helpful 404 instead of a blank page
    notFound();
  }

  return (
    <html lang="en">
      <head />
      <body
        // We intentionally render the generated HTML directly.
        // Later we can sanitize / add CSP if needed.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </html>
  );
}
