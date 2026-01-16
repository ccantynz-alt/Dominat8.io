export const runtime = "nodejs";

type PageProps = {
  params: { projectId: string };
};

export default function PublishedSitePage({ params }: PageProps) {
  const { projectId } = params;

  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between">
          <div className="text-sm text-white/70">
            Published Project: <span className="text-white">{projectId}</span>
          </div>
          <a
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            href="/"
          >
            Home
          </a>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            Live • Public
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Your site is published ✅
          </h1>

          <p className="mt-4 max-w-2xl text-white/75">
            If you can see this page without being redirected, your public publish
            route is working. Next we’ll replace this with a fully polished SaaS
            landing template rendered from your site spec.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              href={`/projects/${projectId}`}
            >
              Open Builder
            </a>

            <a
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              href={`/p/${projectId}?ts=${Date.now()}`}
            >
              Refresh
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
