// app/projects/[projectId]/page.tsx
import Link from "next/link";
import ProjectPublishPanel from "./ProjectPublishPanel";

type PageProps = {
  params: { projectId: string };
};

export default async function ProjectBuilderPage({ params }: PageProps) {
  const projectId = params?.projectId;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6">
          <header className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Project Builder</h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Use the buttons below to seed a draft spec and publish a public page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-mono text-neutral-700">
                  {projectId}
                </span>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Back to Projects
                </Link>
              </div>
            </div>
          </header>

          <ProjectPublishPanel projectId={projectId} />

          <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Next upgrades</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
              <li>Add a real “Generate/Edit Spec” UI (forms or AI agent).</li>
              <li>Lock “Publish” behind Pro plan (Stripe).</li>
              <li>Add custom domains and SEO pages.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
