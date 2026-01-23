import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

type RouteContext = {
  params: { projectId: string };
};

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(haystack: string, needles: string[]) {
  const h = normalize(haystack);
  return needles.some((n) => h.includes(normalize(n)));
}

function getTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function hasMetaDescription(html: string) {
  return /<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(
    html
  );
}

function hasH1WithText(html: string) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return false;
  const text = m[1].replace(/<[^>]+>/g, "").trim();
  return text.length >= 4;
}

function hasCta(html: string) {
  const ctas = ["start free", "generate", "publish", "upgrade", "get started"];
  return includesAny(html, ctas);
}

function auditHtml(html: string) {
  const missing: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  // Minimum publish gates
  if (!getTitle(html)) missing.push("Add a <title> tag for SEO.");
  if (!hasMetaDescription(html)) missing.push('Add <meta name="description" ...> for SEO.');
  if (!hasH1WithText(html)) missing.push("Add a clear H1 headline (human-readable).");
  if (!hasCta(html))
    missing.push('Add at least one clear CTA (e.g., "Start free", "Generate", "Publish", "Upgrade").');

  // Website-only guidance (warn; do not block)
  if (
    includesAny(html, [
      "book a call",
      "schedule a call",
      "book a meeting",
      "free consultation",
      "calendar",
      "zoom",
      "google meet",
    ])
  ) {
    warnings.push(
      "Found calls/meetings language. Direction is website-only automation-first—consider removing calls/meetings wording."
    );
  }

  // Trust and pricing are helpful (notes)
  if (includesAny(html, ["trusted by", "reviews", "rating", "secure", "privacy", "guarantee"])) {
    notes.push("Trust elements detected (good).");
  } else {
    notes.push("Consider adding a trust strip (reviews, guarantees, privacy/security note).");
  }

  if (includesAny(html, ["pricing", "plans", "free", "pro"])) {
    notes.push("Pricing teaser detected (good).");
  } else {
    notes.push("Consider adding a simple pricing teaser (Free vs Pro).");
  }

  notes.push(
    "Audit is tuned for automation-first conversion-ready sites (trust strip/pricing/no-calls handled as notes/warnings, not hard fails)."
  );

  return {
    readyToPublish: missing.length === 0,
    missing,
    warnings,
    notes,
  };
}

export async function POST(_req: Request, ctx: RouteContext) {
  const projectId = ctx.params.projectId;

  // Finish writes to this key
  const key = `generated:project:${projectId}:latest`;

  let html = "";
  try {
    const v = await kv.get(key);
    html = asText(v);
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Audit storage unavailable",
        details: e?.message ? String(e.message) : "KV error",
      },
      { status: 500 }
    );
  }

  if (!html) {
    return NextResponse.json(
      {
        ok: true,
        projectId,
        readyToPublish: false,
        missing: ["No generated HTML yet. Run Finish first."],
        warnings: [],
        notes: [],
      },
      { status: 200 }
    );
  }

  const audit = auditHtml(html);

  return NextResponse.json(
    {
      ok: true,
      projectId,
      readyToPublish: audit.readyToPublish,
      missing: audit.missing,
      warnings: audit.warnings,
      notes: audit.notes,
    },
    { status: 200 }
  );
}
