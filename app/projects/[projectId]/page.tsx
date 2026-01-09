import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function ProjectBuilderPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { userId } = auth();
  if (!userId) return notFound();

  const { projectId } = params;

  // ─────────────────────────────────────────────
  // LOAD PROJECT
  // ─────────────────────────────────────────────
  const project = await kv.get<any>(`project:${projectId}`);
  if (!project || project.ownerId !== userId) return notFound();

  // ─────────────────────────────────────────────
  // LOAD HTML STATE
  // ─────────────────────────────────────────────
  const projectHtmlKey = `generated:project:${projectId}:latest`;
  const projectHtml = await kv.get<string>(projectHtmlKey);

  const isDraft = !!projectHtml;

  // ─────────────────────────────────────────────
  // LOAD PUBLISHED STATE
  // ─────────────────────────────────────────────
  const isPublished = await kv.sismember(
    "public:projects:index",
    projectId
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-gray-500">
            Project ID: {projectId}
          </p>
        </div>

        {/* STATUS */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-2 text-lg font-medium">Status</h2>

          {!projectHtml && (
            <p className="text-red-600">
              ❌ No site content yet
            </p>
          )}

          {projectHtml && !isPublished && (
            <p className="text-yellow-600">
              ⚠️ Draft exists — not published
            </p>
          )}

          {projectHtml && isPublished && (
            <p className="text-green-600">
              ✅ Published
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="rounded-lg border bg-white p-6 space-y-3">
          <h2 className="text-lg font-medium">Actions</h2>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/projects/${projectId}/publish`}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Publish
            </a>

            <a
              href={`/api/generated/latest`}
              className="rounded border px-4 py-2"
            >
              View Raw HTML
            </a>
          </div>

          <p className="text-sm text-gray-500">
            Import, generate, or replace HTML to update this site.
          </p>
        </div>

        {/* PREVIEW */}
        {projectHtml && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">
              Preview
            </h2>

            <iframe
              src={`/p/${projectId}`}
              className="h-[600px] w-full rounded border"
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {!projectHtml && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-2 text-lg font-medium">
              Get started
            </h2>
            <p className="text-sm text-gray-600">
              This project has no content yet.  
              Import HTML or generate a site to continue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
