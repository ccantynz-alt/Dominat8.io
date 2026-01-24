export default function AudienceQualificationStrip() {
  const items = [
    { title: "Solo founders", desc: "Launch a real site fast without hiring a full team." },
    { title: "Local businesses", desc: "Look premium + trustworthy, even on day one." },
    { title: "Agencies", desc: "Generate strong first drafts and iterate with clients." },
    { title: "Side projects", desc: "Ship a clean presence, then grow into pages + SEO." },
  ];

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Built for</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Rural-professional calm, flagship-level polish.
            </h2>
          </div>
          <div className="text-sm text-white/60">
            If you want <span className="text-white/80">premium</span> without chaos — you’re in the right place.
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-base font-medium text-white">{it.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
