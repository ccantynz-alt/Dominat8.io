function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export default function ValuePropositionCyclone() {
  const outcomes = [
    {
      title: "From blank → believable",
      desc: "Instant structure and copy that reads like a real business, not a template.",
      pills: ["Hero + sections", "Tone discipline", "Trust cues"],
    },
    {
      title: "Publishable by default",
      desc: "A site draft you can actually ship while you keep improving it.",
      pills: ["Multi-page ready", "Clean layout rhythm", "CTA placement"],
    },
    {
      title: "SEO foundation, not SEO theater",
      desc: "Sitemap/robots/canonical-ready wiring so search engines see the right thing.",
      pills: ["Indexable pages", "Strong metadata", "Future-proof"],
    },
    {
      title: "Calm iteration loop",
      desc: "Make changes and immediately know what’s live (no guessing).",
      pills: ["Always-fresh policy", "Build stamp", "No stale HTML"],
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">Why Dominat8</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Outcome-driven “WOW” — without gimmicks.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            You’re not buying features. You’re buying a website that looks premium, converts, and can scale into SEO + pages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill>Premium by default</Pill>
          <Pill>Calm pace</Pill>
          <Pill>Ship fast</Pill>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {outcomes.map((o) => (
          <div key={o.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-sm">
            <div className="text-xl font-semibold tracking-tight text-white">{o.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{o.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {o.pills.map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
