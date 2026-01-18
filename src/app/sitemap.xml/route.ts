// src/app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { kv } from "@/src/app/lib/kv";

export const dynamic = "force-dynamic";

function getHost(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  return host.split(",")[0].trim().toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = (url.searchParams.get("projectId") || "").trim();

  if (!projectId) {
    return new NextResponse("Missing projectId. Use /sitemap.xml?projectId=<id>\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const sitemapKey = `project:${projectId}:sitemapXml`;
  const xml = await kv.get(sitemapKey).catch(() => null);

  if (!xml) {
    return new NextResponse(`Sitemap not found.\nkey=${sitemapKey}\n`, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(String(xml), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
