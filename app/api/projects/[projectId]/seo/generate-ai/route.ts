import { NextResponse } from "next/server";
import { z } from "zod";
import { openaiGenerateJson } from "../../../../../lib/openaiResponses";
import { upsertSeoPages, getSeoPages, SeoPage } from "../../../../../lib/seoPagesKV";
import { rateLimitOrThrow } from "../../../../../lib/rateLimitKV";
import { getCurrentUserId } from "../../../../../lib/demoAuth";
import { withBackoff } from "../../../../../lib/openaiRetry";

const Schema = z.object({
  keyword: z.string().min(2).max(120),
  count: z.number().int().min(1).max(25),
  locale: z.string().min(2).max(40).optional(),
  tone: z.string().min(2).max(40).optional(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueSlug(base: string, taken: Set<string>) {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n++;
    if (n > 50) break;
  }
  taken.add(slug);
  return slug;
}

type ModelPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sections: { heading: string; content: string }[];
};

type ModelOutput = {
  pages: ModelPage[];
};

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();

  await rateLimitOrThrow({
    key: `rl:seo:bulk:${userId}:${params.projectId}`,
    limit: 6,
    windowSec: 60,
    message: "Too many bulk generations. Try again in a minute.",
  });

  const body = await req.json();
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { keyword, count, locale, tone } = parsed.data;
  const projectId = params.projectId;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const instructions = [
    "You write high-quality SEO landing pages for real users, not spam.",
    "Return STRICT JSON only. No markdown. No code fences.",
    "No medical/legal/financial advice. No claims you cannot support.",
    "Make pages distinct (different intent). Avoid repetition.",
  ].join(" ");

  const input = [
    `Generate ${count} SEO pages for a website-builder product.`,
    `Core keyword: "${keyword}"`,
    locale ? `Locale: ${locale}` : "",
    tone ? `Tone: ${tone}` : "",
    "",
    "Output JSON schema (must match exactly):",
    `{
  "pages": [
    {
      "slug": "string",
      "title": "string",
      "description": "string",
      "h1": "string",
      "sections": [
        { "heading": "string", "content": "string" }
      ]
    }
  ]
}`,
    "",
    "Rules:",
    "- slug must be URL-safe, lowercase, hyphen-separated.",
    "- title <= 60 chars, description <= 160 chars.",
    "- sections: 4 to 6 sections.",
    "- sections content should be plain text paragraphs.",
  ]
    .filter(Boolean)
    .join("\n");

  const gen = await withBackoff(() =>
    openaiGenerateJson<ModelOutput>({
      model,
      instructions,
      input,
      max_output_tokens: 3500,
    })
  );

  if (!gen.ok) {
    return NextResponse.json(
      { ok: false, error: gen.error, raw: gen.rawText || "" },
      { status: 500 }
    );
  }

  const existing = await getSeoPages(projectId);
  const taken = new Set(existing.map((p) => p.slug));

  const now = new Date().toISOString();

  const pages: SeoPage[] = (gen.value.pages || [])
    .slice(0, count)
    .map((p) => {
      const base = slugify(p.slug || p.h1 || p.title || keyword);
      const slug = uniqueSlug(base, taken);

      return {
        slug,
        title: String(p.title || "").slice(0, 80),
        description: String(p.description || "").slice(0, 200),
        h1: String(p.h1 || p.title || ""),
        sections: Array.isArray(p.sections) ? p.sections.slice(0, 8) : [],
        keyword,
        createdAt: now,
        ai: { model, version: "5B-1.1" },
      };
    })
    .filter((p) => p.slug && p.title && p.h1 && p.sections.length >= 2);

  const merged = await upsertSeoPages(projectId, pages);

  return NextResponse.json({
    ok: true,
    added: pages.length,
    total: merged.length,
    projectId,
  });
}
