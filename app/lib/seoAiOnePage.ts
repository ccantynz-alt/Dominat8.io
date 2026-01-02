import { openaiGenerateJson } from "@/app/lib/openaiResponses";
import { withBackoff } from "@/app/lib/openaiRetry";
import { SeoPage } from "@/app/lib/seoPagesKV";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type ModelOutput = {
  page: {
    slug: string;
    title: string;
    description: string;
    h1: string;
    sections: { heading: string; content: string }[];
  };
};

export async function generateOneSeoPage(opts: {
  keyword: string;
  intent: string;     // e.g. "pricing", "near me", "guide", etc
  forceSlug?: string; // if regenerating, keep the slug stable
}) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const instructions = [
    "You write high-quality SEO landing pages for real users, not spam.",
    "Return STRICT JSON only. No markdown. No code fences.",
    "No medical/legal/financial advice. No unsupported claims.",
    "Make content specific and helpful.",
  ].join(" ");

  const input = [
    `Generate ONE SEO page for a website-builder product.`,
    `Core keyword: "${opts.keyword}"`,
    `Intent: "${opts.intent}"`,
    "",
    "Output JSON schema (must match exactly):",
    `{
  "page": {
    "slug": "string",
    "title": "string",
    "description": "string",
    "h1": "string",
    "sections": [
      { "heading": "string", "content": "string" }
    ]
  }
}`,
    "",
    "Rules:",
    "- title <= 60 chars, description <= 160 chars.",
    "- sections: 4 to 6 sections.",
    "- sections content should be plain text paragraphs.",
    "- slug must be lowercase hyphen-separated.",
  ].join("\n");

  const out = await withBackoff(() =>
    openaiGenerateJson<ModelOutput>({
      model,
      instructions,
      input,
      max_output_tokens: 1800,
    })
  );

  if (!out.ok) throw new Error(out.error);

  const now = new Date().toISOString();

  const raw = out.value.page;
  const computedSlug = slugify(raw.slug || raw.h1 || raw.title || `${opts.keyword}-${opts.intent}`);
  const slug = opts.forceSlug ? opts.forceSlug : computedSlug;

  const page: SeoPage = {
    slug,
    title: String(raw.title || "").slice(0, 80),
    description: String(raw.description || "").slice(0, 200),
    h1: String(raw.h1 || raw.title || ""),
    sections: Array.isArray(raw.sections) ? raw.sections.slice(0, 8) : [],
    keyword: opts.keyword,
    createdAt: now,
    ai: { model, version: "5B-1.1" },
  };

  if (!page.slug || !page.title || !page.h1 || page.sections.length < 2) {
    throw new Error("AI page output was incomplete");
  }

  return page;
}
