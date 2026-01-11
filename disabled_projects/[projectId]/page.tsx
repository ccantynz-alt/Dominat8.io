import Link from "next/link";

export default function DisabledProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params?.projectId ?? "unknown";

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm text-neutral-600 hover:underline"
            href="/projects"
          >
            ← Back to Projects
          </Link>

          <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
            This project is disabled
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Project ID: <span className="font-mono">{projectId}</span>
          </p>

          <p className="mt-4 text-neutral-700">
            This route exists for older links or disabled projects. If you
            believe this is a mistake, go back to Projects and open an active
            project.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
            href="/projects"
          >
            Go to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
