import { auth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

function generatedHtmlKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

export default async function ProjectPreviewPage({ params }: { params: { projectId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-xl font-semibold text-neutral-900">Not signed in</div>
            <p className="mt-2 text-sm text-neutral-600">Please sign in to preview your generated website.</p>
          </div>
        </div>
      </div>
    );
  }

  const projectId = String(params?.projectId || '').trim();
  const record: any = await kv.get(generatedHtmlKey(projectId));

  if (!record?.html) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold text-neutral-900">Preview</div>
              <div className="mt-1 text-sm text-neutral-600">Project ID: {projectId}</div>
            </div>
            <a
              href={`/projects/${encodeURIComponent(projectId)}`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Back to Project
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-neutral-900">Nothing generated yet</div>
            <p className="mt-2 text-sm text-neutral-600">
              Go back to the project and click <b>Generate Website</b> first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render inside an iframe for safety and clean preview
  const html = String(record.html);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-semibold text-neutral-900">Preview</div>
            <div className="mt-1 text-sm text-neutral-600">Project ID: {projectId}</div>
          </div>

          <div className="flex gap-2">
            <a
              href={`/projects/${encodeURIComponent(projectId)}`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Back to Project
            </a>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <iframe
            title="Generated preview"
            srcDoc={html}
            className="h-[80vh] w-full"
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
