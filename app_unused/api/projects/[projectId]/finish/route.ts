import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { buildDemoHtml } from "@/lib/demoStore";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function safeText(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function applyConversionDefaults(html: string) {
  let out = html;

  // 1) Remove call/meeting language (website-only)
  const replacements: Array<[RegExp, string]> = [
    [/book a call/gi, "Start free"],
    [/schedule a call/gi, "Start free"],
    [/request a call/gi, "Start free"],
    [/talk to sales/gi, "Start free"],
    [/contact us for a demo/gi, "Start free"],
    [/book a demo/gi, "Start free"],
    [/schedule a demo/gi, "Start free"],
    [/video call/gi, "website flow"],
    [/zoom call/gi, "website flow"],
    [/calendar invite/gi, "instant setup"],
  ];

  for (const [rx, repl] of replacements) out = out.replace(rx, repl);

  // 2) Inject an automation-first note near the first </h1> if not present
  if (!out.includes("data-automation-first-note")) {
    out = out.replace(
      /<\/h1>/i,
      `</h1>
<p data-automation-first-note style="margin:12px 0 0;opacity:.85;max-width:70ch">
  Website-only. No calls. No meetings. Users self-serve: generate → edit → publish in minutes.
</p>`
    );
  }

  // 3) Add a trust strip at top of body (if body exists)
  if (!out.includes("data-trust-strip")) {
    const bodyOpen = out.match(/<body[^>]*>/i)?.[0] || "";
    if (bodyOpen) {
      out = out.replace(
        bodyOpen,
        `${bodyOpen}
<div data-trust-strip style="padding:10px 16px;background:#111;color:white;font:700 13px system-ui;display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
  <span>✅ Launch in minutes</span>
  <span>✅ Mobile-first</span>
  <span>✅ SEO-ready</span>
  <span>✅ Self-serve only</span>
</div>`
      );
    }
  }

  // 4) Add a simple pricing teaser near end (safe append)
  if (!out.includes("data-pricing-teaser")) {
    out += `
<section data-pricing-teaser style="padding:56px 20px;background:#fafafa;border-top:1px solid #eee">
  <div style="max-width:1000px;margin:0 auto">
    <h2 style="margin:0 0 10px;font:900 24px system-ui;letter-spacing:-.2px">Simple pricing</h2>
    <p style="margin:0 0 18px;opacity:.85;max-width:70ch">
      Start free. Upgrade only when you're ready to publish and scale.
    </p>
    <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <div style="border:1px solid #eee;border-radius:16px;background:white;padding:16px">
        <div style="font-weight:900">Free</div>
        <div style="opacity:.85;margin-top:6">Generate + preview</div>
        <ul style="margin:10px 0 0;padding-left:18px;opacity:.9">
          <li>Create a site</li>
          <li>Preview instantly</li>
          <li>Basic quality check</li>
        </ul>
      </div>
      <div style="border:1px solid #b7ebc6;border-radius:16px;background:#f0fff4;padding:16px">
        <div style="font-weight:900">Pro</div>
        <div style="opacity:.85;margin-top:6">Publish + automation</div>
        <ul style="margin:10px 0 0;padding-left:18px;opacity:.9">
          <li>Publish your site</li>
          <li>Advanced SEO</li>
          <li>Automations</li>
        </ul>
      </div>
    </div>
    <div style="margin-top:14px;font:600 12px system-ui;opacity:.7">
      No fake scarcity. No misleading countdowns. Clear, honest messaging only.
    </div>
  </div>
</section>`;
  }

  return out;
}

function makeSeo(businessName: string, niche: string, location: string) {
  const cleanName = businessName || "Your Business";
  const cleanNiche = niche || "services";
  const cleanLoc = location ? ` in ${location}` : "";
  return {
    title: `${cleanName} | ${cleanNiche}${cleanLoc}`,
    description: `${cleanName} provides ${cleanNiche}${cleanLoc}. Fast, self-serve setup: generate, edit, and publish in minutes.`,
    h1: `${cleanName} — ${cleanNiche}${cleanLoc}`.trim(),
  };
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  // Ensure project exists and belongs to user (auto-create if missing)
  const existing = await kv.get<Project>(projectKey(projectId));
  if (!existing) {
    const now = nowIso();
    const project: Project = {
      id: projectId,
      ownerId: userId,
      name: "My Website",
      createdAt: now,
      updatedAt: now,
    };
    await kv.set(projectKey(projectId), project);
    await kv.lpush(userProjectsKey(userId), projectId);
  } else if (existing.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const businessName = safeText(body?.businessName) || safeText(body?.name) || "My Business";
  const niche = safeText(body?.niche) || "Professional services";
  const location = safeText(body?.location) || "";
  const tone = safeText(body?.tone) || "premium";
  const phone = safeText(body?.phone) || "";
  const email = safeText(body?.email) || "";
  const tagline = safeText(body?.tagline) || safeText(body?.bizTagline) || "";

  // Level 2: build a strict prompt that forces website-only + automation-first conversion
  const prompt = [
    `Create a PREMIUM, conversion-focused business website as a SINGLE HTML document.`,
    `Include <style> and <script> inline. No external assets. Mobile-first.`,
    ``,
    `WEBSITE-ONLY RULES (IMPORTANT):`,
    `- NO calls, NO meetings, NO "book a demo", NO calendars.`,
    `- CTAs must be self-serve: "Start free", "Generate my site", "Publish", "Upgrade".`,
    `- Keep it ethical: no fake countdown timers, no fake scarcity, no deceptive claims.`,
    ``,
    `BUSINESS:`,
    `- Name: ${businessName}`,
    `- Niche: ${niche}`,
    `- Location: ${location || "Not specified"}`,
    `- Tone: ${tone}`,
    `- Tagline: ${tagline || "Not specified"}`,
    `- Phone: ${phone || "Not specified"}`,
    `- Email: ${email || "Not specified"}`,
    ``,
    `STRUCTURE (order):`,
    `1) Hero (headline + short paragraph + Primary CTA "Start free" + Secondary CTA to Services)`,
    `2) Services (3-6 cards)`,
    `3) How it works (3 steps: Generate → Edit → Publish)`,
    `4) Social proof (3 testimonials)`,
    `5) FAQ (4 questions)`,
    `6) Contact (form is front-end only; do NOT promise calls; emphasize self-serve)`,
    `7) Footer (links + small ethics note)`,
    ``,
    `SEO:`,
    `- <title>, meta description, Open Graph basics`,
    ``,
    `OUTPUT: Return ONLY the final HTML document.`,
  ].join("\n");

  // Generate HTML (demo generator)
  let html = buildDemoHtml(prompt);

  // Enforce conversion defaults even if generator misses something
  html = applyConversionDefaults(html);

  // Save
  await kv.set(generatedProjectLatestKey(projectId), html);

  // Return helpful result (do NOT attempt publish here)
  const seo = makeSeo(businessName, niche, location);

  return NextResponse.json(
    {
      ok: true,
      projectId,
      runId: `run_${crypto.randomUUID().replace(/-/g, "")}`,
      seo,
      published: false,
      publishResult: { published: false, status: 0, body: "" },
    },
    { status: 200 }
  );
}
