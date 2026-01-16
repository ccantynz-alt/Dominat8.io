// src/app/p/[projectId]/page.tsx
export const runtime = "nodejs";

import PublishedTemplate from "../../../../app/p/_components/PublishedTemplate";
import { readPublishedSpec } from "../../../../app/p/_lib/readPublishedSpec";

type PageProps = {
  params: { projectId: string };
};

export default async function PublishedProjectPage({ params }: PageProps) {
  const projectId = params?.projectId;

  if (!projectId) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Missing projectId</h1>
        <p className="mt-2 opacity-80">This route requires /p/[projectId].</p>
      </main>
    );
  }

  const spec = (await readPublishedSpec(projectId)) as unknown;

  if (!spec) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Published site not found</h1>
        <p className="mt-2 opacity-80">
          No published spec was found for{" "}
          <code className="rounded bg-black/5 px-2 py-1">{projectId}</code>.
        </p>
      </main>
    );
  }

  return <PublishedTemplate projectId={projectId} spec={spec as any} />;
}
