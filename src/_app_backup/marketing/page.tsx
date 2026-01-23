export const runtime = "nodejs";

import { kv } from '@/src/lib/kv';

const HOMEPAGE_KEY = "marketing:dominat8:homepage:v1";
const GALLERY_KEY = "marketing:dominat8:gallery:v1";

type Homepage = any;

type GalleryDoc = {
  marker?: string;
  updatedAtIso?: string;
  count?: number;
  items?: Array<{
    projectId: string;
    title: string;
    subtitle?: string;
    href: string;
  }>;
  notes?: string;
};

function ButtonLink({ href, children, kind }: { href: string; children: any; kind: "primary" | "secondary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition";
  const primary = "bg-black text-white hover:opacity-90";
  const secondary = "border border-black/15 bg-white text-black hover:bg-black/5";
  return (
    <a href={href} className={`${base} ${kind === "primary" ? primary : secondary}`}>
      {children}
    </a>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow?: string; title: string; children: any }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-14">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-semibold tracking-wider opacity-70">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function safeJson(raw: any) {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function MarketingPage() {
  const homepageRaw = await kv.get(HOMEPAGE_KEY);
  const homepage: Homepage = safeJson(homepageRaw);

  if (!homepage) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Marketing homepage not generated yet</h1>
          <p className="mt-3 opacity-80">
            Run the Marketing Site Agent first:
          </p>
          <pre className="mt-4 rounded-xl bg-black text-white p-4 text-xs overflow-auto">
{`POST /api/marketing/generate-homepage
Body (optional): { "tone": "premium" }`}
          </pre>
        </div>
      </main>
    );
  }

  const galleryRaw = await kv.get(GALLERY_KEY);
  const gallery: GalleryDoc | null = safeJson(galleryRaw);

  const galleryItems = Array.isArray(gallery?.items) ? gallery!.items! : [];

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wider opacity-70">
            {homepage.brand?.name} • {homepage.brand?.domain}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {homepage.hero?.headline}
          </h1>
          <p className="mt-4 text-base opacity-80">
            {homepage.hero?.subheadline}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink kind="primary" href={homepage.hero?.primaryCta?.href || "/sign-in"}>
              {homepage.hero?.primaryCta?.label || "Generate my site"}
            </ButtonLink>
            <ButtonLink kind="secondary" href={homepage.hero?.secondaryCta?.href || "/marketing#gallery"}>
              {homepage.hero?.secondaryCta?.label || "See examples"}
            </ButtonLink>
          </div>

          <ul className="mt-6 space-y-2 text-sm opacity-80">
            {(homepage.hero?.bullets || []).map((b: string, i: number) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROOF */}
      <Section title={homepage.socialProof?.headline || "Trusted by builders"}>
        <div className="grid gap-4 md:grid-cols-3">
          {(homepage.socialProof?.items || []).map((t: string, i: number) => (
            <div key={i} className="rounded-2xl border border-black/10 p-5">
              <p className="text-sm opacity-85">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FEATURES */}
      <Section title={homepage.features?.headline || "Features"}>
        <div className="grid gap-4 md:grid-cols-2">
          {(homepage.features?.items || []).map((f: any, i: number) => (
            <div key={i} className="rounded-2xl border border-black/10 p-6">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm opacity-80">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section title={homepage.howItWorks?.headline || "How it works"}>
        <div className="grid gap-4 md:grid-cols-3">
          {(homepage.howItWorks?.steps || []).map((s: any, i: number) => (
            <div key={i} className="rounded-2xl border border-black/10 p-6">
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm opacity-80">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* USE CASES */}
      <Section title={homepage.useCases?.headline || "Use cases"}>
        <div className="grid gap-4 md:grid-cols-3">
          {(homepage.useCases?.items || []).map((u: any, i: number) => (
            <a
              key={i}
              href={u.href || "#"}
              className="block rounded-2xl border border-black/10 p-6 hover:bg-black/5 transition"
            >
              <h3 className="text-base font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm opacity-80">{u.body}</p>
              <p className="mt-4 text-xs font-semibold opacity-70">Explore →</p>
            </a>
          ))}
        </div>
      </Section>

      {/* GALLERY */}
      <Section id="gallery" eyebrow="Real outputs" title="Examples generated with Dominat8">
        <div className="rounded-2xl border border-black/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm opacity-80">
              {galleryItems.length > 0
                ? `Showing ${galleryItems.length} published sites.`
                : "Gallery not generated yet. Run the Gallery Agent to populate examples."}
            </p>
            <a
              href="/api/marketing/gallery"
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              View gallery JSON →
            </a>
          </div>

          {gallery?.notes ? (
            <p className="mt-2 text-xs opacity-60">{gallery.notes}</p>
          ) : null}

          {galleryItems.length === 0 ? (
            <pre className="mt-5 rounded-xl bg-black text-white p-4 text-xs overflow-auto">
{`POST /api/marketing/generate-gallery
Body (optional): { "limit": 12 }`}
            </pre>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {galleryItems.map((it, i) => (
                <a
                  key={i}
                  href={it.href}
                  className="block rounded-2xl border border-black/10 p-5 hover:bg-black/5 transition"
                >
                  <h3 className="text-base font-semibold">{it.title}</h3>
                  {it.subtitle ? <p className="mt-2 text-sm opacity-75">{it.subtitle}</p> : null}
                  <p className="mt-4 text-xs font-semibold opacity-70">Open →</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* PRICING TEASER */}
      <Section title={homepage.pricingTeaser?.headline || "Pricing"}>
        <div className="rounded-2xl border border-black/10 p-6">
          <p className="text-sm opacity-85">{homepage.pricingTeaser?.body}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ButtonLink kind="primary" href={homepage.pricingTeaser?.primaryCta?.href || "/pricing"}>
              {homepage.pricingTeaser?.primaryCta?.label || "See pricing"}
            </ButtonLink>
            <p className="text-xs opacity-70">{homepage.pricingTeaser?.note}</p>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section title={homepage.faq?.headline || "FAQs"}>
        <div className="space-y-3">
          {(homepage.faq?.items || []).map((x: any, i: number) => (
            <details key={i} className="rounded-2xl border border-black/10 p-5">
              <summary className="cursor-pointer text-sm font-semibold">{x.q}</summary>
              <p className="mt-2 text-sm opacity-80">{x.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 p-6">
          <p className="text-xs opacity-70">{homepage.footer?.finePrint}</p>
          <div className="flex gap-4 text-xs font-semibold opacity-80">
            {(homepage.footer?.links || []).map((l: any, i: number) => (
              <a key={i} href={l.href || "#"} className="hover:opacity-100">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

