import Link from "next/link";
import { storeGet } from "./lib/store";

export const runtime = "nodejs";

type HomeLatest = {
  setAt: string;
  projectId: string;
  runId: string;
  summary?: string;
  previewHtml: string;
};

const HOME_LATEST_KEY = "home:latest";

export default async function HomePage() {
  const home = await storeGet<HomeLatest>(HOME_LATEST_KEY);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">my-saas-app</div>
            <div className="text-xs text-zinc-400">Home</div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/projects"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Projects
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/generated"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Generated
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!home ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-semibold tracking-tight">No home set yet</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Go to a project run and click <span className="text-zinc-200">Apply & Set Home</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/projects"
                className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
              >
                Go to Projects
              </Link>
              <Link
                href="/generated"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
              >
                View /generated
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Live Home Preview</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Set from <span className="text-zinc-200">{home.runId}</span> •{" "}
                  {new Date(home.setAt).toLocaleString()}
                </p>
              </div>

              <div className="text-xs text-zinc-500">
                Project: <span className="text-zinc-300">{home.projectId}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
              <iframe
                title="Home Preview"
                className="h-[620px] w-full rounded-xl bg-white"
                srcDoc={home.previewHtml}
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
              />
            </div>

            {home.summary ? (
              <div className="mt-4 text-sm text-zinc-300">
                <span className="text-zinc-200 font-medium">Summary:</span> {home.summary}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
