export const dynamic = "force-dynamic";

import { BUILD_MARKER, MONSTER_MARKER } from "../lib/buildMarker";
import { TopBar, HeaderNav, Footer } from "../components/marketing/MarketingShell";

function daysSince(ts) {
  if (!ts) return null;
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return h + " hours ago";
  const d = Math.floor(h / 24);
  return d + " days ago";
}

async function getGallery() {
  const base = process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "";
  const res = await fetch(base + "/api/gallery/list", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json.cards) ? json.cards : [];
}

function pickFeatured(cards) {
  const published = cards.filter(c => c.hasPublished);
  if (published.length === 0) return null;

  // Sort newest first if timestamp exists
  published.sort((a, b) => {
    const ta = new Date(a.publishedAt || a.updatedAt || 0).getTime();
    const tb = new Date(b.publishedAt || b.updatedAt || 0).getTime();
    return tb - ta;
  });

  // Stable daily rotation
  const day = Math.floor(Date.now() / 86400000);
  return published[day % published.length];
}

function Card({ card, featured }) {
  const href = card.url || ("/p/" + card.projectId);
  const age = daysSince(card.publishedAt || card.updatedAt);

  return (
    <a href={href} className={`group rounded-[2rem] bg-white/85 ring-1 ring-slate-200 shadow-sm overflow-hidden ${featured ? "md:col-span-2" : ""}`}>
      <div className="relative h-48 bg-white">
        <img
          className="h-full w-full object-cover"
          src={"/api/gallery/thumb?projectId=" + card.projectId}
          alt={card.title}
        />
        {featured && (
          <div className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="text-xs text-slate-500">{age ? "Generated " + age : "Generated recently"}</div>
        <div className="mt-2 text-lg font-semibold text-slate-950">{card.title}</div>
        <div className="mt-2 text-sm text-slate-700">{card.desc}</div>
        <div className="mt-4 text-sm font-semibold text-slate-900 group-hover:underline">
          Open live →
        </div>
      </div>
    </a>
  );
}

export default async function HomePage() {
  const cards = await getGallery();
  const featured = pickFeatured(cards);
  const rest = cards.filter(c => !featured || c.projectId !== featured.projectId).slice(0, 2);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <HeaderNav />

      <section className="mx-auto max-w-6xl px-6 pt-6 pb-12">
        <h2 className="text-2xl font-semibold">Featured today</h2>
        <p className="mt-2 text-sm text-slate-600">
          Auto-selected from real published projects • rotates daily
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {featured && <Card card={featured} featured />}
          {rest.map(c => <Card key={c.projectId} card={c} />)}
        </div>

        <div className="mt-4 text-[11px] text-slate-500">
          Marker: <span className="font-mono">{MONSTER_MARKER}</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
