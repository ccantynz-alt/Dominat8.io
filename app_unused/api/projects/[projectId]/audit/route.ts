import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

function hasTag(html: string, tag: string) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, "i");
  return re.test(html);
}

function getTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function hasMetaDescription(html: string) {
  // <meta name="description" content="...">
  const re = /<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i;
  return re.test(html);
}

function hasH1WithText(html: string) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return false;
  const text = m[1].replace(/<[^>]+>/g, "").trim();
  return text.length >= 4;
}

function hasCta(html: string) {
  // Flexible: allow common CTA wording used in your product direction
  const ctas = [
    "start free",
    "generate",
    "publish",
    "upgrade",
    "get started",
    "get a quote",
    "create site",
  ];
  return includesAny(html, ctas);
}

function scoreAudit(html: string) {
  const missing: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const title = getTitle(html);
  if (!title) missing.push("Add a <title> tag for SEO.");
  if (!hasMetaDescription(html)) missing.push('Add <meta name="description" ...> for SEO.');
  if (!hasH1WithText(html)) missing.push("Add a clear H1 headline (human-readable).");

  // CTA should exist somewhere in the page for conversion
  if (!hasCta(html)) missing.push('Add at least one clear CTA (e.g., "Start free", "Generate", "Publish", "Upgrade").');

  // Good-to-have notes that match your current defaults (do NOT fail audit)
  if (includesAny(html, ["trust", "trusted by", "reviews", "rating", "secure"])) {
    notes.push("Trust elements detected (good).");
  } else {
    notes.push("Consider adding a trust strip (reviews, guarantees, privacy/security note).");
  }

  if (includesAny(html, ["pricing", "plans", "free", "pro"])) {
    notes.push("Pricing teaser detected (good).");
  } else {
    notes.push("Consider adding a simple pricing teaser (Free vs Pro).");
  }

  // Ensure automation-first / website-only language (warn only)
  if (includesAny(html, ["book a call", "schedule a call", "book a meeting", "free consultation", "calendar"])) {
    warnings.push("Found call/meeting language. Product direction is website-only automation-first—consider removing calls/meetings wording.");
  }

  // If HTML is suspiciously tiny, warn
  if (html.trim().length < 500) warnings.push("HTML looks very small—preview may be incomplete.");

  // Your generation already applies ethical conversion defaults.
  notes.push("Audit is tuned for automation-first conversion-ready sites (trust strip/pricing/no-calls handled as notes/warnings, not hard fails).");

  const readyToPublish = missing.length === 0;

  return { missing, warnings, notes, readyToPublish };
}

export async function POST(_req: Request, ctx: RouteContext) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  // Read generated HTML stored by Finish:
  // generated:project:<id>:latest
  let html = "";
  try {
    const key = `generated:project:${projectId}:latest`;
    const v = await kv.get(key);
    html = asText(v);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Audit storage unavailable", details: e?.message ? String(e.message) : "KV error" },
      { status: 500 }
    );
  }

  if (!html) {
    return NextResponse.json(
      {
        ok: true,
        readyToPublish: false,
        missing: ["No generated HTML found yet. Click Finish → Quality Check first."],
        warnings: [],
        notes: [],
      },
      { status: 200 }
    );
  }

  const { missing, warnings, notes, readyToPublish } = scoreAudit(html);

  return NextResponse.json(
    {
      ok: true,
      projectId,
      readyToPublish,
      missing,
      warnings,
      notes,
    },
    { status: 200 }
  );
}
