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

function safeLower(s: string) {
  return (s || "").toLowerCase();
}

function removeCallMeetingLanguage(html: string) {
  // Remove common “book a call / consultation / meeting” phrases (website-only direction)
  const patterns: RegExp[] = [
    /\bbook a call\b/gi,
    /\bschedule a call\b/gi,
    /\bfree consultation\b/gi,
    /\bbook a consultation\b/gi,
    /\bschedule a consultation\b/gi,
    /\bbook a meeting\b/gi,
    /\bschedule a meeting\b/gi,
    /\bcalendar\b/gi,
    /\bdiscovery call\b/gi,
  ];

  let out = html;
  for (const re of patterns) out = out.replace(re, "get started");
  return out;
}

function ensureTrustStrip(html: string) {
  // If already has "Trusted by" or "Reviews" etc., don’t add another.
  const h = safeLower(html);
  const hasTrust =
    h.includes("trusted by") ||
    h.includes("reviews") ||
    h.includes("rating") ||
    h.includes("guarantee") ||
    h.includes("secure");

  if (hasTrust) return html;

  const trustBlock = `
<section style="padding:18px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:22px 0;">
  <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;">
    <div style="font-weight:700;">Trusted, secure, and transparent</div>
    <div style="opacity:.8;">No calls • No pressure • Clear pricing • Privacy-first</div>
  </div>
</section>
`.trim();

  // Insert after first </header> if present, else after <body>
  if (/<\/header>/i.test(html)) {
    return html.replace(/<\/header>/i, `</header>\n${trustBlock}\n`);
  }
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body[^>]*>/i, (m) => `${m}\n${trustBlock}\n`);
  }
  return trustBlock + "\n" + html;
}

function ensurePricingTeaser(html: string) {
  const h = safeLower(html);
  const hasPricing = h.includes("pricing") || h.includes("plans") || h.includes("free") || h.includes("pro");

  if (hasPricing) return html;

  const pricingBlock = `
<section style="padding:18px 0;margin:22px 0;">
  <h2 style="margin:0 0 10px 0;">Simple plans</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
    <div style="border:1px solid #eee;border-radius:14px;padding:14px;">
      <div style="font-weight:700;">Free</div>
      <div style="opacity:.8;margin-top:6px;">Generate and preview</div>
    </div>
    <div style="border:1px solid #111;border-radius:14px;padding:14px;">
      <div style="font-weight:700;">Pro</div>
      <div style="opacity:.8;margin-top:6px;">Publish + upgrades</div>
    </div>
  </div>
</section>
`.trim();

  // Insert before </main> if present, else before </body>, else append
  if (/<\/main>/i.test(html)) {
    return html.replace(/<\/main>/i, `${pricingBlock}\n</main>`);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${pricingBlock}\n</body>`);
  }
  return html + "\n" + pricingBlock;
}

function ensureEthicsNote(html: string) {
  const h = safeLower(html);
  const hasEthics =
    h.includes("ethical") ||
    h.includes("no pressure") ||
    h.includes("transparent") ||
    h.includes("privacy");

  if (hasEthics) return html;

  const note = `
<p style="opacity:.75;font-size:14px;margin-top:10px;">
  Ethical by default: clear CTAs, transparent pricing cues, and no fake scarcity.
</p>
`.trim();

  // Put near end of page (before </footer> or </body>)
  if (/<\/footer>/i.test(html)) {
    return html.replace(/<\/footer>/i, `${note}\n</footer>`);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${note}\n</body>`);
  }
  return html + "\n" + note;
}

function ensureBasicCTA(html: string) {
  // If there is already "Start free/Generate/Publish/Upgrade", do nothing.
  const h = safeLower(html);
  const hasCTA =
    h.includes("start free") ||
    h.includes("generate") ||
    h.includes("publish") ||
    h.includes("upgrade") ||
    h.includes("get started");

  if (hasCTA) return html;

  const cta = `
<div style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0;">
  <a href="#start" style="display:inline-block;padding:10px 14px;border-radius:12px;background:#111;color:#fff;text-decoration:none;font-weight:700;">
    Start free
  </a>
  <a href="#pricing" style="display:inline-block;padding:10px 14px;border-radius:12px;border:1px solid #ddd;color:#111;text-decoration:none;">
    See plans
  </a>
</div>
`.trim();

  // Insert after first <h1> block if present; else after <body>
  if (/<h1[^>]*>[\s\S]*?<\/h1>/i.test(html)) {
    return html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/i, `$1\n${cta}\n`);
  }
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body[^>]*>/i, (m) => `${m}\n${cta}\n`);
  }
  return cta + "\n" + html;
}

function applyConversionImprovements(html: string) {
  let out = html;

  out = removeCallMeetingLanguage(out);
  out = ensureBasicCTA(out);
  out = ensureTrustStrip(out);
  out = ensurePricingTeaser(out);
  out = ensureEthicsNote(out);

  return out;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    agent: "conversion",
    projectId: ctx.params.projectId,
    message: "Conversion agent is online. POST to apply conversion improvements to generated HTML.",
  });
}

export async function POST(req: Request, ctx: RouteContext) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const instructions =
    typeof body?.instructions === "string" ? body.instructions.trim() : "";

  // Read current generated HTML from KV (same key Finish uses)
  const key = `generated:project:${projectId}:latest`;

  let html = "";
  try {
    const v = await kv.get(key);
    html = asText(v);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "KV read failed", details: e?.message ? String(e.message) : "KV error" },
      { status: 500 }
    );
  }

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No generated HTML found. Run Finish → Quality Check first." },
      { status: 404 }
    );
  }

  // Apply improvements (server-side)
  const updatedHtml = applyConversionImprovements(html);

  // Save back to KV
  try {
    await kv.set(key, updatedHtml);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "KV write failed", details: e?.message ? String(e.message) : "KV error" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    projectId,
    updated: updatedHtml !== html,
    instructions,
    message: "Conversion improvements applied. Reload preview to see changes.",
  });
}
