// src/app/robots.txt/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getProto(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return proto.split(",")[0].trim();
}

function getHost(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  return host.split(",")[0].trim();
}

export async function GET(req: Request) {
  const proto = getProto(req);
  const host = getHost(req);

  const sitemapUrl = host ? `${proto}://${host}/sitemap.xml` : `/sitemap.xml`;

  const body = ["User-agent: *", "Allow: /", `Sitemap: ${sitemapUrl}`, ""].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
