// app/site/[projectId]/robots.txt/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "@/app/lib/store";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, buildCanonical } from "@/app/lib/seo";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";

  // If private and not admin: disallow everything
  if (visibility === "private" && !admin) {
    const body = `User-agent: *\nDisallow: /\n`;
    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const seo = await getProjectSEO(params.projectId);

  // If no canonicalBase, keep it safe: allow, but no sitemap link
  const sitemapUrl = seo.canonicalBase
    ? (seo.canonicalBase.replace(/\/+$/, "") + `/site/${params.projectId}/sitemap.xml`)
    : "";

  // Robots meta can be "noindex", but robots.txt cannot set noindex reliably across engines,
  // so we honor private mode here and otherwise allow crawl.
  const lines = [
    `User-agent: *`,
    `Allow: /`,
    sitemapUrl ? `Sitemap: ${sitemapUrl}` : "",
    ``,
  ].filter(Boolean);

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
