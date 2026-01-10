import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

function generatedProjectLatestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function includesAny(html: string, patterns: string[]) {
  const h = html.toLowerCase();
  return patterns.some((p) => h.includes(p.toLowerCase()));
}

export async function POST(
  _req: Request,
  ctx: { params: { projectId: string } }
) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const html = (await kv.get<string>(generatedProjectLatestKey(projectId))) || "";

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No generated HTML found for this project yet." },
      { status: 404 }
    );
  }

  const missing: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  // Required sections (look for common anchors/ids/words)
  const checks: { key: string; patterns: string[] }[] = [
    { key: "Hero section", patterns: ["<h1", "hero", "get started", "contact"] },
    { key: "Services section", patterns: ["#services", 'id="services"', "services"] },
    { key: "Work/Portfolio section", patterns: ["#work", 'id="work"', "portfolio", "case study"] },
    { key: "About section", patterns: ["#about", 'id="about"', "about"] },
    { key: "Testimonials section", patterns: ["#testimonials", 'id="testimonials"', "testimonial"] },
    { key: "FAQ section", patterns: ["#faq", 'id="faq"', "faq"] },
    { key: "Contact section", patterns: ["#contact", 'id="contact"', "<form", "contact"] },
  ];

  for (const c of checks) {
    if (!includesAny(html, c.patterns)) {
      missing.push(c.key);
    }
  }

  // Basic SEO checks
  if (!includesAny(html, ["<title>"])) warnings.push("Missing <title> tag");
  if (!includesAny(html, ['name="description"', "name='description'"]))
    warnings.push("Missing meta description");
  if (!includesAny(html, ['property="og:title"', "property='og:title'"]))
    notes.push("Optional: add Open Graph tags for nicer link previews");

  // Links sanity
  if (!includesAny(html, ['href="#contact"', "href='#contact'"]))
    notes.push("Optional: add a primary CTA that links to #contact");

  const readyToPublish = missing.length === 0 && warnings.length === 0;

  return NextResponse.json(
    {
      ok: true,
      readyToPublish,
      missing,
      warnings,
      notes,
    },
    { status: 200 }
  );
}
