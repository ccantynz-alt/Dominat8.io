// app/site/[projectId]/p/[category]/[slug]/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "@/app/lib/store";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, injectSEOIntoHtml } from "@/app/lib/seo";
import { getProgramPages } from "@/app/lib/programPagesKV";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; category: string; slug: string } }
) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";
  if (visibility === "private" && !admin) return new NextResponse("Private", { status: 403 });

  const pages = await getProgramPages(params.projectId);
  const page = pages.find(
    (p) => p.category === params.category && p.slug === params.slug
  );
  if (!page) return new NextResponse("Not found", { status: 404 });

  const seo = await getProjectSEO(params.projectId);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const html = `<!doctype html>
<html>
<head></head>
<body>
  <main style="max-width:960px;margin:40px auto;padding:16px;font-family:system-ui;">
    <h1>${page.h1}</h1>
    <p>${page.description}</p>

    <ul>
      ${page.bullets.map((b) => `<li>${b}</li>`).join("")}
    </ul>

    <h2>FAQs</h2>
    ${page.faq
      .map(
        (f) => `<p><strong>${f.q}</strong><br/>${f.a}</p>`
      )
      .join("")}
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
      schemaJsonLd: faqSchema,
    },
  });

  return new NextResponse(finalHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
