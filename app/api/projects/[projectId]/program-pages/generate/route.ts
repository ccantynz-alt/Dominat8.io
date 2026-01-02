// app/api/projects/[projectId]/program-pages/generate/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProgramPages, setProgramPages, KVProgramPage } from "@/app/lib/programPagesKV";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  // Starter high-intent SaaS pages (safe + scalable)
  const generated: KVProgramPage[] = [
    {
      category: "templates",
      slug: "ai-landing-page",
      title: "AI Landing Page Builder",
      description: "Generate high-converting landing pages with AI in minutes.",
      h1: "AI Landing Page Builder",
      bullets: [
        "Hero, pricing, FAQ, contact included",
        "SEO-ready structure",
        "Multi-page generation",
        "Instant preview and apply",
      ],
      faq: [
        { q: "Can I generate a full landing page?", a: "Yes. AI generates complete, publishable HTML." },
        { q: "Is it SEO-ready?", a: "Yes. Titles, descriptions, schema, and clean HTML." },
      ],
    },
    {
      category: "use-cases",
      slug: "build-website-fast",
      title: "Build a Website Fast with AI",
      description: "Launch a real website in minutes using AI-generated pages.",
      h1: "Build a Website Fast with AI",
      bullets: [
        "No code required",
        "Safe apply and publish",
        "Iterate with versioned runs",
      ],
      faq: [
        { q: "How fast can I launch?", a: "Most users publish the same day." },
      ],
    },
    {
      category: "features",
      slug: "ai-multi-page",
      title: "AI Multi-Page Website Generation",
      description: "Generate complete multi-page sites in a single AI run.",
      h1: "AI Multi-Page Website Generation",
      bullets: [
        "Home, pricing, about, contact",
        "Consistent navigation",
        "Structured output",
      ],
      faq: [
        { q: "Does it generate multiple pages?", a: "Yes. Multi-page is a core feature." },
      ],
    },
    {
      category: "comparisons",
      slug: "base44-alternative",
      title: "Base44 Alternative",
      description: "Compare AI website builders with versioned runs and safe publishing.",
      h1: "Base44 Alternative",
      bullets: [
        "Versioned runs",
        "Explicit apply workflow",
        "SEO-ready HTML output",
      ],
      faq: [
        { q: "What should I compare?", a: "Workflow reliability, versioning, and SEO readiness." },
      ],
    },
  ];

  // Merge with existing (avoid duplicates)
  const existing = await getProgramPages(params.projectId);
  const merged = [
    ...existing,
    ...generated.filter(
      (g) => !existing.some((e) => e.category === g.category && e.slug === g.slug)
    ),
  ];

  await setProgramPages(params.projectId, merged);

  return NextResponse.json({ ok: true, count: merged.length });
}
