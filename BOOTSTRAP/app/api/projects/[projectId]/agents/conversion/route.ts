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

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Remove call/meeting language (website-only)
function removeCallMeetingLanguage(html: string) {
  const patterns: Array<[RegExp, string]> = [
    [/\bbook a call\b/gi, "get started"],
    [/\bschedule a call\b/gi, "get started"],
    [/\bbook a meeting\b/gi, "get started"],
    [/\bfree consultation\b/gi, "free setup"],
    [/\bcalendar\b/gi, "dashboard"],
    [/\bzoom\b/gi, ""],
    [/\bgoogle meet\b/gi, ""],
    [/\bmeet with\b/gi, "work with"],
  ];

  let out = html;
  for (const [re, rep] of patterns) out = out.replace(re, rep);
  return out;
}

function injectAfterOpeningBody(html: string, snippet: string): { html: string; updated: boolean } {
  const bodyOpen = html.match(/<body[^>]*>/i);
  if (!bodyOpen) return { html, updated: false };

  const idx = bodyOpen.index!;
  const openTag = bodyOpen[0];
  const insertPos = idx + openTag.length;

  const next = html.slice(0, insertPos) + snippet + html.slice(insertPos);
  return { html: next, updated: true };
}

function ensureTrustStrip(html: string) {
  // If we already have obvious trust cues, skip.
  if (
    includesAny(html, [
      "trusted by",
      "reviews",
      "rating",
      "secure",
      "privacy",
      "guarantee",
      "money-back",
    ])
  ) {
    return { html, updated: false };
  }

  const snippet = `
<section style="max-width:1100px;margin:14px auto 0;padding:10px 14px;border:1px solid #eee;border-radius:14px;background:#fff;">
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
    <div style="font-weight:700;">Trusted, secure, and transparent</div>
    <div style="opacity:.75;font-size:13px;">
      No phone calls. No pressure. Website-only automation — you stay in control.
    </div>
  </div>
</section>
`;
  return injectAfterOpeningBody(html, snippet);
}

function ensurePricingTeaser(html: string) {
  if (includesAny(html, ["pricing", "plans", "free", "pro"])) {
    return { html, updated: false };
  }

  const snippet = `
<section style="max-width:1100px;margin:14px auto 0;padding:14px;border:1px solid #eee;border-radius:14px;background:#fff;">
  <div style="font-weight:800;font-size:16px;">Simple plans</div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;">
    <div style="flex:1;min-width:240px;border:1px solid #eee;border-radius:12px;padding:12px;">
      <div style="font-weight:800;">Free</div>
      <div style="opacity:.75;margin-top:6px;">Generate and preview sites.</div>
      <div style="opacity:.75;margin-top:6px;">Publish requires Pro.</div>
    </div>
    <div style="flex:1;min-width:240px;border:1px solid #111;border-radius:12px;padding:12px;">
      <div style="font-weight:800;">Pro</div>
      <div style="opacity:.75;margin-top:6px;">One-click Finish → Quality Check → Publish.</div>
      <div style="opacity:.75;margin-top:6px;">Built for automation-first businesses.</div>
    </div>
  </div>
</section>
`;
  return injectAfterOpeningBody(html, snippet);
}

function ensureEthicsNote(html: string) {
  if (includesAny(html, ["ethical", "no fake", "no false", "no pressure", "transparent"])) {
    return { html, updated: false };
  }

  const snippet = `
<section style="max-width:1100px;margin:14px auto 0;padding:12px 14px;border:1px solid #eee;border-radius:14px;background:#fff;">
  <div style="font-weight:700;">Ethical marketing</div>
  <div style="opacity:.75;font-size:13px;margin-top:6px;">
    We avoid fake scarcity and misleading claims. Clear pricing, clear outcomes, and privacy-respecting automation.
  </div>
</section>
`;
  return injectAfterOpeningBody(html, snippet);
}

function ensurePrimaryCTA(html: string) {
  // If common CTA text exists, skip.
  if (includesAny(html, ["start free", "generate", "publish", "upgrade", "get started"])) {
    return { html, updated: false };
  }

  // Try to place a CTA near the top of body.
  const snippet = `
<div style="max-width:1100px;margin:16px auto 0;padding:0 12px;">
  <a href="#get-started" style="display:inline-block;padding:12px 16px;border-radius:12px;border:1px solid #111;background:#111;color:#fff;text-decoration:none;font-weight:800;">
    Start free
  </a>
  <span style="margin-left:10px;opacity:.7;font-size:13px;">Generate a site in minutes. Publish with Pro.</span>
</div>
`;
  return injectAfterOpeningBody(html, snippet);
}

function applyConversionImprovements(html: string, instructions: string) {
  // We do safe, deterministic improvements (string-based).
  // Instructions are stored/echoed but not used for risky transformations.
  const safeInstructions = String(instructions || "").slice(0, 1000);

  let out = html;
  let changed = false;

  const removed = removeCallMeetingLanguage(out);
  if (removed !== out) {
    out = removed;
    changed = true;
  }

  const cta = ensurePrimaryCTA(out);
  if (cta.updated) {
    out = cta.html;
    changed = true;
  }

  const trust = ensureTrustStrip(out);
  if (trust.updated) {
    out = trust.html;
    changed = true;
  }

  const pricing = ensurePricingTeaser(out);
  if (pricing.updated) {
    out = pricing.html;
    changed = true;
  }

  const ethics = ensureEthicsNote(out);
  if (ethics.updated) {
    out = ethics.html;
    changed = true;
  }

  // Add an HTML comment marker (useful for debugging; harmless)
  if (!includesAny(out, ["conversion-agent"])) {
    out = out.replace(
      /<\/body>/i,
      `\n<!-- conversion-agent: ${escapeHtml(safeInstructions)} -->\n</body>`
    );
    changed = true;
  }

  return { html: out, updated: changed };
}

export async function POST(req: Request, ctx: RouteContext) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  // Optional owner check (only enforced if a project record exists)
  try {
    const proj: any = await kv.get(`project:${projectId}`);
    const ownerId =
      proj?.ownerId || proj?.userId || proj?.clerkUserId || proj?.owner;
    if (ownerId && String(ownerId) !== String(userId)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  } catch {
    // ignore
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const instructions =
    typeof body?.instructions === "string" ? body.instructions : "";

  // Load current generated HTML
  const key = `generated:project:${projectId}:latest`;

  let currentHtml = "";
  try {
    currentHtml = asText(await kv.get(key));
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Storage unavailable",
        details: e?.message ? String(e.message) : "KV error",
      },
      { status: 500 }
    );
  }

  if (!currentHtml) {
    return NextResponse.json(
      {
        ok: false,
        error: "No generated HTML found. Run Finish first.",
      },
      { status: 400 }
    );
  }

  const result = applyConversionImprovements(currentHtml, instructions);

  if (result.updated) {
    try {
      await kv.set(key, result.html);
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          error: "Write failed",
          details: e?.message ? String(e.message) : "KV error",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      ok: true,
      projectId,
      updated: result.updated,
      instructions,
      message: "Conversion improvements applied. Reload preview to see changes.",
    },
    { status: 200 }
  );
}
