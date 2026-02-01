export const dynamic = "force-dynamic";

import { MONSTER_MARKER } from "../../../lib/buildMarker";
import { TopBar, HeaderNav, Footer } from "../../../components/marketing/MarketingShell";

async function getGallery() {
  const base = process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "";
  const url = (base ? base : "") + "/api/gallery/list";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { ok: false, cards: [] };
  return await res.json();
}

export default async function GalleryPage() {
  const data = await getGallery();
  const cards = data && Array.isArray(data.cards) ? data.cards : [];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(900px_circle_at_80%_15%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(700px_circle_at_50%_90%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.74),rgba(255,255,255,1))]" />
      </div>

      <TopBar />
      <HeaderNav />

      <section className="mx-auto max-w-6xl px-6 pt-2 pb-10">
        <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs text-slate-700 ring-1 ring-slate-200 shadow-sm">
          Gallery • real published projects • <span className="font-mono text-slate-500">{MONSTER_MARKER}</span>
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          Real Published Gallery
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
          Now with real preview thumbnails (SVG) generated from KV and cacheable via the thumb endpoint.
        </p>

        {cards.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white/85 p-8 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">Gallery is empty (index not set)</div>
            <div className="mt-2 text-sm text-slate-700 leading-relaxed">
              Set <span className="font-mono">gallery:index:v1</span> with published project IDs, then rebuild thumbnails.
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-600">Next steps</div>
              <ol className="mt-2 space-y-1 text-xs text-slate-700 list-decimal list-inside">
                <li>POST IDs to <span className="font-mono">/api/gallery/admin/set-index</span></li>
                <li>POST to <span className="font-mono">/api/gallery/admin/rebuild-previews</span></li>
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/p/new">
                Generate a project
              </a>
              <a className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm" href="/__status">
                Check deploy status
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {cards.map((c) => (
              <a
                key={c.projectId}
                href={c.url || ("/p/" + c.projectId)}
                className="group overflow-hidden rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm hover:bg-white transition"
              >
                <div className="h-36 bg-white">
                  <img
                    alt={c.title}
                    className="h-full w-full object-cover"
                    src={"/api/gallery/thumb?projectId=" + encodeURIComponent(c.projectId) + "&v=" + encodeURIComponent(MONSTER_MARKER)}
                  />
                </div>

                <div className="p-6">
                  <div className="text-xs text-slate-500">
                    {c.hasPublished ? "Published" : "Indexed"} • Project {c.projectId}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{c.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-700">{c.desc}</div>

                  <div className="mt-5 text-sm font-semibold text-slate-900 group-hover:underline">
                    Open →
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
