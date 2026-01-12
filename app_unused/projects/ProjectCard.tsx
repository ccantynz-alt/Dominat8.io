// app/projects/ProjectCard.tsx
import Link from "next/link";

type ProjectLike = {
  id: string;
  name?: string | null;

  domain?: string | null;
  domainStatus?: string | null;

  publishedUrl?: string | null;
  publishedStatus?: string | null;
  publishedAt?: string | null;

  updatedAt?: string | null;
  createdAt?: string | null;

  status?: string | null;
  published?: string | boolean | null;
};

function isTruthyPublishedFlag(v: unknown) {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes" || s === "published";
  }
  return false;
}

function formatDate(s?: string | null) {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function ProjectCard({ project }: { project: ProjectLike }) {
  const projectId = project.id;

  const domain = (project.domain ?? "").trim();
  const hasDomain = domain.length > 0;

  const publishedUrl = (project.publishedUrl ?? "").trim();
  const publishedStatus = (project.publishedStatus ?? "").toLowerCase().trim();
  const status = (project.status ?? "").toLowerCase().trim();

  const isPublished =
    publishedUrl.length > 0 ||
    publishedStatus === "published" ||
    status === "published" ||
    isTruthyPublishedFlag(project.published);

  const updatedLabel =
    formatDate(project.updatedAt) || formatDate(project.createdAt) || "";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold truncate">
            {project.name?.trim() || "Untitled project"}
          </div>

          {updatedLabel ? (
            <div className="mt-1 text-xs text-gray-500">
              Updated: {updatedLabel}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isPublished ? (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
                ✅ Published
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                📝 Draft
              </span>
            )}

            {hasDomain ? (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                🌐 {domain}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                🌐 No domain
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Open
          </Link>

          <Link
            href={`/projects/${projectId}/publish`}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Publish
          </Link>

          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Open Live Site
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
