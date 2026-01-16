// pages/api/projects/[projectId]/agents/finish-for-me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { loadSiteSpec, saveSiteSpec } from "@/app/lib/projectSpecStore";

function nowIso() {
  return new Date().toISOString();
}

function ensureFirstPage(spec: any) {
  spec.pages = Array.isArray(spec.pages) ? spec.pages : [];
  if (!spec.pages[0]) spec.pages[0] = { slug: "/", title: "Home" };
  return spec.pages[0];
}

function upsertHero(page: any, brandName: string) {
  page.hero = page.hero ?? {};
  page.hero.headline =
    page.hero.headline ??
    `${brandName} that looks premium and converts`;

  page.hero.subheadline =
    page.hero.subheadline ??
    "A clean, conversion-first site that builds trust fast and makes the next step obvious.";

  page.hero.primaryCta = page.hero.primaryCta ?? { label: "Get started", href: "#cta" };
  page.hero.secondaryCta = page.hero.secondaryCta ?? { label: "See features", href: "#features" };
}

function upsertFeatures(page: any) {
  page.sections = Array.isArray(page.sections) ? page.sections : [];
  const existing = page.sections.find((s: any) => s?.type === "features");
  if (existing) return;

  page.sections.push({
    type: "features",
    items: [
      { title: "Premium structure", body: "Modern layout, clean hierarchy, and strong spacing that looks credible." },
      { title: "Conversion-first flow", body: "Hero → proof → benefits → FAQ → clear CTA, in the order that sells." },
      { title: "Mobile-ready", body: "Responsive sections that hold up on phones, tablets, and desktop." },
      { title: "Fast and simple", body: "No fluff. Just the sections that move visitors toward action." },
      { title: "Trust built-in", body: "Clear value prop and confidence blocks that reduce hesitation." },
      { title: "Spec-driven", body: "Your public site updates when the spec updates." },
    ],
  });
}

function upsertFaq(page: any) {
  page.sections = Array.isArray(page.sections) ? page.sections : [];
  const existing = page.sections.find((s: any) => s?.type === "faq");
  if (existing) return;

  page.sections.push({
    type: "faq",
    items: [
      { q: "What do I do next?", a: "Click Publish, then open your public page to see the premium layout live." },
      { q: "Can I change wording later?", a: "Yes. This is a draft spec upgrade — you can iterate and republish." },
      { q: "Is it mobile friendly?", a: "Yes — the structure and spacing are designed for all screen sizes." },
    ],
  });
}

function summarize(spec: any) {
  const pages = Array.isArray(spec?.pages) ? spec.pages : [];
  const p0 = pages[0] ?? {};
  const sections = Array.isArray(p0?.sections) ? p0.sections : [];
  return {
    brandName: spec?.brandName ?? null,
    version: spec?.version ?? null,
    pages: pages.length,
    heroHeadline: p0?.hero?.headline ?? null,
    sections: sections.map((s: any) => s?.type).filter(Boolean),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

    const projectId = String(req.query.projectId || "");
    if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

    const draft = await loadSiteSpec(projectId);
    if (!draft) {
      return res.status(400).json({
        ok: false,
        error: "No draft spec found. Run seed-spec first.",
        hint: `/api/projects/${projectId}/seed-spec`,
      });
    }

    const spec = { ...draft };

    // Lightly normalize required-ish fields without breaking your existing shape
    spec.projectId = spec.projectId ?? projectId;
    spec.version = spec.version ?? "1";
    spec.brandName = spec.brandName ?? "Your Brand";
    spec.createdAtIso = spec.createdAtIso ?? nowIso();
    spec.updatedAtIso = nowIso();

    const firstPage = ensureFirstPage(spec);
    firstPage.slug = firstPage.slug ?? "/";
    firstPage.title = firstPage.title ?? "Home";

    upsertHero(firstPage, String(spec.brandName));
    upsertFeatures(firstPage);
    upsertFaq(firstPage);

    // Bump version safely (string or number)
    const v = typeof spec.version === "string" ? parseInt(spec.version, 10) : Number(spec.version);
    if (!Number.isNaN(v)) spec.version = String(v + 1);

    await saveSiteSpec(projectId, spec);

    return res.status(200).json({
      ok: true,
      projectId,
      message: "Finish-for-me applied: hero + features + FAQ added (if missing).",
      summary: summarize(spec),
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
}
