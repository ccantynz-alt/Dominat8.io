import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
};

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function historyKey(projectId: string) {
  return `history:project:${projectId}`;
}

function nowIso() {
  return new Date().toISOString();
}

type HistoryItem = {
  ts: string;
  label: string;
  html: string;
};

function clampInstruction(s: string) {
  const cleaned = String(s || "").trim();
  if (!cleaned) return "";
  return cleaned.slice(0, 400);
}

/**
 * Conversion Agent (SaaS Builder-first):
 * - Drives users to automated actions: Start free / Create project / Generate / Publish / Upgrade
 * - Avoids quotes, phone, video calls, meetings
 */
function applyConversionPass(html: string, instruction: string) {
  let out = html;

  const instr = instruction.toLowerCase();

  const wantsPremium =
    instr.includes("premium") ||
    instr.includes("luxury") ||
    instr.includes("upmarket") ||
    instr.includes("professional") ||
    instr.includes("corporate");

  const wantsUrgency =
    instr.includes("urgent") ||
    instr.includes("aggressive") ||
    instr.includes("sales") ||
    instr.includes("stronger") ||
    instr.includes("more direct") ||
    instr.includes("today") ||
    instr.includes("now") ||
    instr.includes("faster");

  const wantsTrust =
    instr.includes("trust") ||
    instr.includes("reliable") ||
    instr.includes("safe") ||
    instr.includes("secure") ||
    instr.includes("privacy") ||
    instr.includes("professional");

  // 1) Replace common CTAs with SaaS automation CTAs
  // We intentionally do NOT push phone/quote/calls.
  out = out
    .replace(/Request a Quote/gi, "Start free")
    .replace(/Get a Quote/gi, "Start free")
    .replace(/Book Now/gi, "Create my website")
    .replace(/Contact Us/gi, "Start free")
    .replace(/Get Started/gi, "Start free")
    .replace(/Learn More/gi, "See how it works");

  // 2) Premium hero headline tweak (safe)
  out = out.replace(/<h1[^>]*>([^<]{0,140})<\/h1>/i, (_m, text) => {
    const base = String(text || "").trim() || "Build a website that sells";
    if (wantsPremium) return `<h1>${base} — premium sites, generated in minutes</h1>`;
    if (wantsUrgency) return `<h1>${base} — launch today in minutes</h1>`;
    return `<h1>${base} — create yours in minutes</h1>`;
  });

  // 3) Add a premium + automation subline near top (safe)
  const supportLine = wantsPremium
    ? "Automated setup. Clean design. Publish fast — no meetings, no back-and-forth."
    : "Automated setup — generate a site, customise, and publish fast. No meetings.";

  if (!/no meetings|automated setup|publish fast/i.test(out)) {
    out = out.replace(
      /<\/header>|<\/section>/i,
      `<p style="font-weight:800;color:#111;margin:10px 0 0">${supportLine}</p>$&`
    );
  }

  // 4) Add trust line if requested (safe)
  if (wantsTrust && !/secure|privacy|reliable|built for/i.test(out)) {
    out = out.replace(
      /<\/header>|<\/section>/i,
      `<p style="font-weight:700;color:#111;margin:10px 0 0">Secure by design, reliable publishing, and simple pricing.</p>$&`
    );
  }

  // 5) Add ethical urgency (safe)
  if (wantsUrgency && !/limited|peak|slots|today/i.test(out)) {
    out = out.replace(
      /<\/header>|<\/section>/i,
      `<p style="font-weight:800;color:#111;margin:10px 0 0">Launch today — your first version can be live in minutes.</p>$&`
    );
  }

  // 6) Ensure at least one strong CTA exists. Prefer /projects or /sign-up, otherwise fallback to #contact.
  const hasProjectsLink = /href="\/projects"/i.test(out);
  const hasSignupLink = /href="\/sign-up"|href="\/signup"/i.test(out);

  if (!hasProjectsLink && !hasSignupLink) {
    // Add a bottom CTA that stays website-only
    out = out.replace(
      /<\/body>/i,
      `<div style="margin:18px 0;text-align:center">
         <a href="/projects" style="display:inline-block;padding:14px 18px;border-radius:12px;background:#0b5fff;color:#fff;font-weight:900;text-decoration:none">
           Start free
         </a>
       </div></body>`
    );
  }

  // 7) If there is a form submit button, make it automation-first
  out = out.replace(/(type="submit"[^>]*>)([^<]{0,50})(<\/button>)/gi, (_m, a, _b, c) => {
    return `${a}Start free${c}`;
  });

  return out;
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const project = await kv.get<Project>(projectKey(projectId));
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const currentHtml = await kv.get<string>(generatedProjectLatestKey(projectId));
  if (!currentHtml) {
    return NextResponse.json({ ok: false, error: "No generated HTML to optimize yet" }, { status: 400 });
  }

  let instruction = "";
  try {
    const body: any = await req.json();
    instruction = clampInstruction(body?.instruction || "");
  } catch {
    instruction = "";
  }

  const snapshot: HistoryItem = {
    ts: nowIso(),
    label: instruction ? `Conversion Agent: ${instruction}` : "Conversion Agent",
    html: currentHtml,
  };

  await kv.lpush(historyKey(projectId), snapshot);
  await kv.ltrim(historyKey(projectId), 0, 9);

  const updatedHtml = applyConversionPass(currentHtml, instruction);
  await kv.set(generatedProjectLatestKey(projectId), updatedHtml);

  return NextResponse.json({
    ok: true,
    agent: "conversion",
    instruction,
    message: "Conversion Agent applied (SaaS automation-first). Undo is available.",
  });
}
