import Link from "next/link";
import { storeGet } from "../lib/store";

export const runtime = "nodejs";

type Applied = {
  ok: boolean;
  appliedAt: string;
  projectId: string;
  runId: string;
  prompt: string;
  summary: string;
  files: { path: string; content: string }[];
  previewHtml: string;
};

const GENERATED_LATEST_KEY = "generated:latest";

export default async function GeneratedPage() {
  const applied = await storeGet<Applied>(GENERATED_LATEST_KEY);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Generated</div>
            <div className="text-xs text-zinc-400">Preview + output files</div>
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {!applied ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-semibold">Nothing applied yet</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Go to a project run and click <span className="text-zinc-200">Apply</span>.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Live Preview</h1>
                  <p className="mt-1 text-sm text-zinc-400">
                    Applied from <span className="text-zinc-200">{applied.runId}</span> •{" "}
                    {new Date(applied.appliedAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-xs text-zinc-500">
                  Project: <span className="text-zinc-300">{applied.projectId}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                <iframe
                  title="Generated Preview"
                  className="h-[520px] w-full rounded-xl bg-white"
                  srcDoc={applied.previewHtml}
                  sandbox="allow-scripts allow-forms allow-popups allow-modals"
                />
              </div>

              {applied.summary ? (
                <div className="mt-4 text-sm text-zinc-300">
                  <span className="text-zinc-200 font-medium">Summary:</span> {applied.summary}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Files</h2>
                <span className="text-sm text-zinc-400">{applied.files.length} total</span>
              </div>

              <div className="mt-4 grid gap-3">
                {applied.files.map((f) => (
                  <div key={f.path} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs text-zinc-400">{f.path}</div>
                    <pre className="mt-3 overflow-x-auto text-xs text-zinc-200">{f.content}</pre>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
