import * as React from "react";

type AnyObj = Record<string, any>;

const S = (v: any, f = "") => (typeof v === "string" ? v : f);
const A = (v: any) => (Array.isArray(v) ? v : []);
const O = (v: any) => (v && typeof v === "object" ? v : {});
const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

function Section({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      {(title || subtitle) ? (
        <div className="mb-5">
          {title ? <h2 className="text-2xl font-semibold tracking-tight">{title}</h2> : null}
          {subtitle ? <p className="mt-2 max-w-3xl text-sm opacity-80">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border px-3 py-1 text-xs opacity-80">{children}</span>;
}

export default function MarketingHomeV2(props: {
  homepage: AnyObj | null;
  flow: AnyObj | null;
  gallery: AnyObj | null;
  debug?: boolean;
  wire?: boolean;
}) {
  const hp = O(props.homepage);
  const fl = O(props.flow);
  const ga = O(props.gallery);

  const hero = O(hp.hero || hp.header || hp.top);
  const heroKicker = S(hero.kicker || hp.kicker, "");
  const heroTitle = S(hero.title || hp.title, "Dominate your website automation.");
  const heroSubtitle = S(hero.subtitle || hero.description || hp.subtitle, "Agents build. You ship.");

  const cta1 = O(hero.ctaPrimary || hp.ctaPrimary || hp.primaryCta);
  const cta2 = O(hero.ctaSecondary || hp.ctaSecondary || hp.secondaryCta);

  const cta1Label = S(cta1.label || cta1.text, "Get started");
  const cta1Href = S(cta1.href || cta1.url, "/sign-in");
  const cta2Label = S(cta2.label || cta2.text, "View gallery");
  const cta2Href = S(cta2.href || cta2.url, "/gallery");

  const valueProps = A(hp.valueProps || hp.bullets || hp.highlights || hp.features).slice(0, 6);
  const steps = A(fl.steps || fl.cards || fl.flow).slice(0, 12);

  const pricing = O(hp.pricing || hp.plans || hp.tiers);
  const plans = A(pricing.plans || pricing.tiers || hp.plans || hp.tiers).slice(0, 4);

  const faq = A(hp.faq || hp.faqItems || hp.questions).slice(0, 8);
  const galleryItems = A(ga.items || ga.gallery || ga.value || ga).slice(0, 12);

  const has = {
    hero: !!heroTitle,
    valueProps: valueProps.length > 0,
    flow: steps.length > 0,
    gallery: galleryItems.length > 0,
    pricing: plans.length > 0,
    faq: faq.length > 0,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <a href="/" className="text-sm font-semibold tracking-tight">Dominat8</a>
        <nav className="hidden items-center gap-6 text-sm opacity-80 md:flex">
          <a href="#how">How it works</a>
          <a href="#gallery">Gallery</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a href={cta1Href} className="rounded-xl bg-black px-4 py-2 text-sm text-white">Start</a>
      </header>

      {(props.debug || props.wire) ? (
        <div className="mt-6 rounded-2xl border p-4 text-xs">
          <div className="font-semibold">Preview</div>
          {props.debug ? (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <pre className="overflow-auto rounded-lg bg-black/5 p-3">homepage keys: {Object.keys(hp).join(", ")}</pre>
              <pre className="overflow-auto rounded-lg bg-black/5 p-3">flow keys: {Object.keys(fl).join(", ")}</pre>
            </div>
          ) : null}
          {props.wire ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill>hero: {String(has.hero)}</Pill>
              <Pill>valueProps: {String(has.valueProps)}</Pill>
              <Pill>flow: {String(has.flow)}</Pill>
              <Pill>gallery: {String(has.gallery)}</Pill>
              <Pill>pricing: {String(has.pricing)}</Pill>
              <Pill>faq: {String(has.faq)}</Pill>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-8 rounded-3xl border p-8 md:p-12">
        <div className="max-w-3xl">
          {heroKicker ? <div className="mb-3"><Pill>{heroKicker}</Pill></div> : null}
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{heroTitle}</h1>
          <p className="mt-4 text-base opacity-80 md:text-lg">{heroSubtitle}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={cta1Href} className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-white">
              {cta1Label}
            </a>
            <a href={cta2Href} className="inline-flex items-center justify-center rounded-xl border px-5 py-3">
              {cta2Label}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 opacity-80">
            <Pill>Agents</Pill><Pill>SEO</Pill><Pill>Sitemaps</Pill><Pill>Publish</Pill><Pill>Domains</Pill>
          </div>
        </div>
      </section>

      <Section title="What you get" subtitle="Stable shell, KV-driven content.">
        <div className="grid gap-4 md:grid-cols-3">
          {(valueProps.length ? valueProps : [
            { title: "Layout + copy separation", body: "Agents write specs. Renderer decides structure." },
            { title: "SEO baked in", body: "Plans, sitemaps, canonicals, intent pages." },
            { title: "Publish pipeline", body: "From spec → deployed site with one action." },
          ]).slice(0, 6).map((it: any, idx: number) => (
            <div key={idx} className="rounded-3xl border p-6">
              <div className="text-lg font-semibold">{S(it.title || it.label, "Value")}</div>
              <div className="mt-2 text-sm opacity-80">{S(it.body || it.description, "")}</div>
            </div>
          ))}
        </div>
      </Section>

      <div id="how" />
      <Section title="How it works" subtitle="From marketing:dominat8:flow:v1 (fallbacks included).">
        <div className={cx("grid gap-4", "md:grid-cols-3")}>
          {(steps.length ? steps : [
            { title: "Describe your business", body: "Give the agent your niche + goal." },
            { title: "Agents build pages", body: "SEO plan, sitemap, program pages." },
            { title: "Publish & attach domain", body: "Ship to Dominat8.com or your own domain." },
          ]).slice(0, 12).map((st: any, idx: number) => (
            <div key={idx} className="rounded-3xl border p-6">
              <div className="text-sm opacity-60">Step {idx + 1}</div>
              <div className="mt-2 text-lg font-semibold">{S(st.title || st.headline, `Step ${idx + 1}`)}</div>
              {S(st.body || st.description, "") ? <div className="mt-2 text-sm opacity-80">{S(st.body || st.description, "")}</div> : null}
            </div>
          ))}
        </div>
      </Section>

      <div id="gallery" />
      <Section title="Gallery" subtitle="Pulled from marketing gallery KV if present.">
        <div className="grid gap-4 md:grid-cols-3">
          {(galleryItems.length ? galleryItems : new Array(6).fill(null)).slice(0, 12).map((g: any, idx: number) => (
            <div key={idx} className="rounded-3xl border p-6">
              <div className="text-sm font-semibold">{S(g?.name || g?.title, "Template")}</div>
              <div className="mt-1 text-sm opacity-70">{S(g?.tagline || g?.category, "Generated example")}</div>
              <div className="mt-4 rounded-2xl border bg-black/5 p-10 text-center text-xs opacity-70">Preview image slot</div>
            </div>
          ))}
        </div>
      </Section>

      <div id="pricing" />
      <Section title="Pricing" subtitle="From homepage pricing spec (fallbacks included).">
        <div className="grid gap-4 md:grid-cols-3">
          {(plans.length ? plans : [
            { name: "Free", price: "$0", features: ["1 site", "Basic publish", "Community support"] },
            { name: "Pro", price: "$29", features: ["Custom domain", "SEO agents", "Program pages"] },
            { name: "Business", price: "$99", features: ["Multiple sites", "Team access", "Priority support"] },
          ]).slice(0, 4).map((p: any, idx: number) => (
            <div key={idx} className={cx("rounded-3xl border p-6", idx === 1 ? "shadow-sm" : "")}>
              <div className="text-lg font-semibold">{S(p.name || p.title, "Plan")}</div>
              <div className="mt-2 text-3xl font-semibold">{S(p.price || p.amount, "")}</div>
              <ul className="mt-4 grid gap-2 text-sm opacity-90">
                {A(p.features).slice(0, 8).map((f: any, i: number) => (
                  <li key={i} className="rounded-xl border px-3 py-2">{S(f, S(f?.text, "Feature"))}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div id="faq" />
      <Section title="FAQ" subtitle="Optional. Uses homepage spec if present.">
        <div className="grid gap-3">
          {(faq.length ? faq : [
            { q: "Can I use my own domain?", a: "Yes. Pro includes custom domain mapping." },
            { q: "Do the agents write SEO pages?", a: "Yes. The pipeline can generate program/intent pages." },
            { q: "Is this a website builder or automation?", a: "Both: builder + agents that maintain and grow the site." },
          ]).slice(0, 8).map((it: any, idx: number) => (
            <div key={idx} className="rounded-2xl border p-5">
              <div className="font-semibold">{S(it.q || it.question || it.title, "Question")}</div>
              <div className="mt-2 text-sm opacity-80">{S(it.a || it.answer || it.body, "")}</div>
            </div>
          ))}
        </div>
      </Section>

      <footer className="mt-12 rounded-3xl border p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold">Ready to dominate?</div>
            <div className="mt-1 text-sm opacity-80">Stable shell. Agents move the content.</div>
          </div>
          <a href={cta1Href} className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-white">
            {cta1Label}
          </a>
        </div>
        <div className="mt-6 text-xs opacity-60">© {new Date().getFullYear()} Dominat8</div>
      </footer>
    </main>
  );
}
