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

function getTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function hasMetaDescription(html: string) {
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

function runAudit(html: string) {
  const missing: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const title = getTitle(html);
  if (!title) missing.push("Add a <title> tag for SEO.");
  if (!hasMetaDescription(html)) missing.push('Add <meta name="description" ...> for SEO.');
  if (!hasH1WithText(html)) missing.push("Add a clear H1 headline (human-readable).");
  if (!hasCta(html)) missing.push('Add at least one clear CTA (e.g., "Start free", "Generate", "Publish", "Upgrade").');

  // Website-only direction (warn only)
  if (includesAny(html, ["book a call", "schedule a call", "book a meeting", "free consultation", "calendar"])) {
    warnings.push("Found call/meeting language. Product direction is website-only automation-first—consider removing calls/meetings wording.");
  }

  // Notes: trust/pricing are nice but not blockers
  if (includesAny(html, ["trusted by", "reviews", "rating", "secure", "guarantee"])) {
    notes.push("Trust elements detected (good).");
  } else {
    notes.push("Consider adding a trust strip (reviews, guarantees, privacy/security note).");
  }

  if (includesAny(html, ["pricing", "plans", "free", "pro"])) {
    notes.push("Pricing teaser detected (good).");
  } else {
    notes.push("Consider adding a simple pricing teaser (Free vs Pro).");
  }

  const readyToPublish = missing.length === 0;
  return { readyToPublish, missing, warnings, notes };
}

export async function POST(_req: Request, ctx: RouteContext) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  // Load generated HTML from KV (Finish stores here)
  const key = `generated:project:${projectId}:latest`;

  let html = "";
  try {
    const v = await kv.get(key);
    html = asText(v);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Publish storage unavailable", details: e?.message ? String(e.message) : "KV error" },
      { status: 500 }
    );
  }

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No generated HTML found. Run Finish → Quality Check first." },
      { status: 400 }
    );
  }

  // Server-side quality gate
  const audit = runAudit(html);
  if (!audit.readyToPublish) {
    return NextResponse.json(
      {
        ok: false,
        error: "Not ready to publish",
        readyToPublish: false,
        missing: audit.missing,
        warnings: audit.warnings,
        notes: audit.notes,
      },
      { status: 409 }
    );
  }

  // NOTE: Pro gate is expected to exist in your app.
  // If your repo already enforces Pro via Stripe/Clerk, keep using it.
  // This server-side audit gate is additive and safe.

  // Write "published" HTML key (used by /p/<projectId>)
  const publishedKey = `published:project:${projectId}:latest`;

  try {
    await kv.set(publishedKey, html);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Publish write failed", details: e?.message ? String(e.message) : "KV error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      projectId,
      publicUrl: `/p/${projectId}`,
    },
    { status: 200 }
  );
}
