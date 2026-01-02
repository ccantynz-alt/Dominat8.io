// app/site/[projectId]/p/[category]/[slug]/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "@/app/lib/store";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, injectSEOIntoHtml } from "@/app/lib/seo";
import { PROGRAM_PAGES } from "@/app/lib/programmaticPages";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

function titleCase(s: string) {
  return s
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; category: string; slug: string } }
) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";

  if (visibility === "private" && !admin) {
    return new NextResponse("Private site", { status: 403 });
  }

  const page = PROGRAM_PAGES.find(
    (p) => p.category === (params.category as any) && p.slug === params.slug
  );

  if (!page) return new NextResponse("Not found", { status: 404 });

  const seo = await getProjectSEO(params.projectId);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: seo.siteName || "AI Website Builder",
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    description: page.description,
  };

  const html = `<!doctype html>
<html>
<head></head>
<body>
  <main style="max-width:980px;margin:40px auto;padding:16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.7;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <div>
        <div style="opacity:.7;font-size:12px;">${titleCase(page.category)}</div>
        <h1 style="margin:6px 0 0;font-size:32px;">${page.h1}</h1>
        <p style="margin:10px 0 0;opacity:.9;max-width:70ch;">${page.description}</p>
      </div>
      <nav style="display:flex;gap:10px;flex-wrap:wrap;">
        <a href="/site/${params.projectId}" style="text-decoration:none;border:1px solid rgba(0,0,0,.14);padding:8px 12px;border-radius:999px;">Home</a>
        <a href="/site/${params.projectId}/pricing" style="text-decoration:none;border:1px solid rgba(0,0,0,.14);padding:8px 12px;border-radius:999px;">Pricing</a>
        <a href="/site/${params.projectId}/contact" style="text-decoration:none;border:1px solid rgba(0,0,0,.14);padding:8px 12px;border-radius:999px;">Contact</a>
      </nav>
    </header>

    <section style="margin-top:20px;">
      <h2 style="margin:0 0 10px;">What you get</h2>
      <ul style="margin:0;padding-left:18px;">
        ${page.bullets.map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </section>

    <section style="margin-top:24px;">
      <h2 style="margin:0 0 10px;">Frequently asked questions</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
        ${page.faq
          .map(
            (f) => `<div style="border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:12px;">
              <div style="font-weight:900;">${f.q}</div>
              <div style="opacity:.9;margin-top:6px;">${f.a}</div>
            </div>`
          )
          .join("")}
      </div>
    </section>

    <section style="margin-top:24px;">
      <h2 style="margin:0 0 10px;">Explore more</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
        ${PROGRAM_PAGES.slice(0, 12)
          .map(
            (p) => `<a href="/site/${params.projectId}/p/${p.category}/${p.slug}"
              style="text-decoration:none;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:10px 12px;display:block;">
              <div style="font-weight:900;">${p.title}</div>
              <div style="opacity:.75;font-size:13px;">${titleCase(p.category)}</div>
            </a>`
          )
          .join("")}
      </div>
    </section>

    <footer style="margin-top:26px;opacity:.7;font-size:12px;">
      © ${new Date().getFullYear()} ${seo.siteName || "AI Website Builder"}
    </footer>
  </main>
</body>
</html>`;

  const finalHtml = injectSEOIntoHtml({
    html,
    path: `/site/${params.projectId}/p/${page.category}/${page.slug}`,
    seo,
    pageTitleFallback: page.title,
    pageOverride: {
      title: page.title,
      description: page.description,
      schemaJsonLd: [faqSchema, softwareSchema],
    },
  });

  return new NextResponse(finalHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
