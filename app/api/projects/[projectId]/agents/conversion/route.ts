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

/**
 * Undo snapshots are stored as a short history list in KV.
 * We store the HTML BEFORE agent changes so the user can "Undo last change".
 */
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
  // Keep it short and safe (novice UX)
  return cleaned.slice(0, 400);
}

/**
 * Conversion Agent: controlled transformation.
 * This version is WEBSITE-FIRST:
 * - Drives users to on-site contact/quote form
 * - Avoids phone-specific CTAs
 */
function applyConversionPass(html: string, instruction: string) {
  let out = html;

  const instr = instruction.toLowerCase();

  // Intent flags
  const wantsUrgency =
    instr.includes("urgent") ||
    instr.includes("aggressive") ||
    instr.includes("sales") ||
    instr.includes("stronger") ||
    instr.includes("more direct") ||
    instr.includes("book now") ||
    instr.includes("limited") ||
    instr.includes("today");

  const wantsPremium =
    instr.includes("premium") ||
    instr.includes("luxury") ||
    instr.includes("upmarket") ||
    instr.includes("professional") ||
    instr.includes("corporate");

  const wantsTrust =
    instr.includes("trust") ||
    instr.includes("reviews") ||
    instr.includes("proof") ||
    instr.includes("guarantee") ||
    instr.includes("reliable") ||
    instr.includes("safe");

  // 1) Normalize common CTAs to website actions
  out = out.replace(/(Get Started|Contact Us|Learn More|Request a Quote|Book Now)/gi, "Get a Quote");

  // 2) Improve hero headline slightly (safe)
  out = out.replace(/<h1[^>]*>([^<]{0,140})<\/h1>/i, (_m, text) => {
    const base = String(text || "").trim() || "Get the results you want";
    if (wantsPremium) return `<h1>${base} — premium, reliable, and on time</h1>`;
    if (wantsUrgency) return `<h1>${base} — book online in minutes</h1>`;
    return `<h1>${base} — get a quote fast</h1>`;
  });

  // 3) Add a strong supporting line near the top (safe append)
  const supportLine =
    wantsUrgency
      ? "Fast online booking — secure your time slot today."
      : wantsPremium
        ? "Professional service with clear pricing and on-time delivery."
        : "Get a fast quote and book online in minutes.";

  if (!/fast online booking|book online in minutes|get a fast quote/i.test(out)) {
    out = out.replace(/<\/header>|<\/section>/i, `<p style="font-weight:800;color:#111;margin:10px 0 0">${supportLine}</p>$&`);
  }

  // 4) Add trust line if requested (safe)
  if (wantsTrust && !/trusted|reliable|review|rated/i.test(out)) {
    out = out.replace(
      /<\/header>|<\/section>/i,
      `<p style="font-weight:700;color:#111;margin:10px 0 0">Trusted, reliable service — built for busy customers.</p>$&`
    );
  }

  // 5) Ensure there is at least one strong CTA to #contact (website-only)
  // If there is no #contact anchor button/link, add one at the bottom.
  if (!/<a[^>]+href="#contact"[^>]*>/i.test(out)) {
    out = out.replace(
      /<\/body>/i,
      `<div style="margin:18px 0;text-align:center">
         <a href="#contact" style="display:inline-block;padding:14px 18px;border-radius:12px;background:#0b5fff;color:#fff;font-weight:900;text-decoration:none">
           Get a Quote
         </a>
       </div></body>`
    );
  }

  // 6) If the page has a contact form, make the submit button wording stronger (safe)
  out = out.replace(/(type="submit"[^>]*>)([^<]{0,40})(<\/button>)/gi, (_m, a, _b, c) => {
    return `${a}Get My Quote${c}`;
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

  // Read optional instruction
  let instruction = "";
  try {
    const body: any = await req.json();
    instruction = clampInstruction(body?.instruction || "");
  } catch {
    instruction = "";
  }

  // Save undo snapshot BEFORE changes
  const snapshot: HistoryItem = {
    ts: nowIso(),
    label: instruction ? `Conversion Agent: ${instruction}` : "Conversion Agent",
    html: currentHtml,
  };

  await kv.lpush(historyKey(projectId), snapshot);
  // Keep only last 10 snapshots
  await kv.ltrim(historyKey(projectId), 0, 9);

  // Apply controlled pass
  const updatedHtml = applyConversionPass(currentHtml, instruction);

  await kv.set(generatedProjectLatestKey(projectId), updatedHtml);

  return NextResponse.json({
    ok: true,
    agent: "conversion",
    instruction,
    message: "Conversion Agent applied (website-only). Undo is available.",
  });
}
