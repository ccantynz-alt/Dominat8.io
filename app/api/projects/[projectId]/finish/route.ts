import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { buildDemoHtml } from "@/lib/demoStore";

export const runtime = "nodejs";

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

/**
 * Finish-for-me (Level 2)
 * DEFAULT BEHAVIOUR:
 * - Generates HTML
 * - Applies automation-first conversion defaults
 * - Stores ready-to-convert HTML
 */
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

  const project = await kv.get<any>(projectKey(projectId));
  if (!project || project.ownerId !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const businessName = String(body?.businessName || "My Business");
  const niche = String(body?.niche || "Professional services");
  const location = String(body?.location || "");
  const phone = String(body?.phone || "");
  const email = String(body?.email || "");
  const tagline = String(body?.tagline || "");

  // 1) Generate base HTML
  let html = buildDemoHtml(
    `Create a premium, modern website.
Business: ${businessName}
Niche: ${niche}
Location: ${location}
Tagline: ${tagline}

Rules:
- Website-only
- No calls, no meetings
- Clear CTAs
- Professional tone
- Mobile-first
- SEO basics`
  );

  // 2) DEFAULT CONVERSION PASS (AUTOMATION-FIRST)
  html = html
    .replace(/Get a Quote/gi, "Start free")
    .replace(/Book a Call/gi, "Start free")
    .replace(/Contact us for a demo/gi, "Start free");

  if (!html.includes("Website-only")) {
    html = html.replace(
      "</h1>",
      `</h1><p style="margin-top:12px;font-weight:600;opacity:.85">
      Website-only. No calls. Generate, edit, and publish in minutes.
      </p>`
    );
  }

  if (!html.includes("Simple pricing")) {
    html += `
<section style="padding:56px 20px;background:#fafafa;border-top:1px solid #eee">
  <div style="max-width:1000px;margin:0 auto">
    <h2 style="margin:0 0 10px;font:800 24px system-ui">Simple pricing</h2>
    <p style="opacity:.85">Start free. Upgrade when you’re ready to publish.</p>
  </div>
</section>`;
  }

  // 3) Store final HTML
  await kv.set(generatedProjectLatestKey(projectId), html);

  return NextResponse.json({ ok: true });
}
