export default function HowItWorksCalm() {
  const steps = [
    {
      n: "01",
      title: "Pick a direction",
      desc: "Choose a template vibe and a goal. We generate a strong first draft immediately.",
    },
    {
      n: "02",
      title: "Agents refine the site",
      desc: "Structure, copy, and SEO wiring improve in passes — without breaking the calm design rhythm.",
    },
    {
      n: "03",
      title: "Publish and grow",
      desc: "Ship a premium homepage now, then expand into pages, SEO, and custom domains as you scale.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/60">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Three steps. Calm execution.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
          The point is to get you to “publishable” fast — then iterate with confidence.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-xs tracking-[0.22em] text-white/55">STEP {s.n}</div>
              <div className="mt-2 text-lg font-semibold text-white">{s.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/65">
            Want the flagship look on your domain?
            <span className="text-white/80"> Publish first</span>, then iterate.
          </div>

          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.10] px-5 py-2 text-sm font-medium text-white hover:bg-white/[0.14]"
          >
            Build your homepage
          </a>
        </div>
      </div>
    </section>
  );
}
