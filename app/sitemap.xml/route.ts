// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { kv } from "@/src/app/lib/kv";

export const dynamic = "force-dynamic";

function getHost(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  return host.split(",")[0].trim().toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 1) explicit projectId still supported
  const explicit = (url.searchParams.get("projectId") || "").trim();

  // 2) fallback: host mapping
  const host = getHost(req);
  let projectId = explicit;

  if (!projectId && host) {
    const mapped = await kv.get(`domain:${host}:projectId`).catch(() => null);
    if (mapped) projectId = String(mapped).trim();
  }

  if (!projectId) {
    const body = [
      "Missing projectId for sitemap.",
      "",
      "Fix options:",
      "  A) Use query param:",
      "     /sitemap.xml?projectId=<yourProjectId>",
      "",
      "  B) Map this host to a projectId (recommended):",
      `     domain:${host || "<host>"}:projectId => <yourProjectId>`,
      "",
      "Admin endpoint (requires ADMIN_API_KEY):",
      "  POST /api/debug/map-domain",
      '  Headers: x-admin-key: <ADMIN_API_KEY>',
      `  Body: {"host":"${host || "<your-host>"}","projectId":"<yourProjectId>"}`,
      "",
      `Detected host: ${host || "(none)"}`,
      "",
    ].join("\n");

    return new NextResponse(body, {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const sitemapKey = `project:${projectId}:sitemapXml`;
  const xml = await kv.get(sitemapKey).catch(() => null);

  if (!xml) {
    const body = [
      "Sitemap not found for project.",
      "",
      `projectId: ${projectId}`,
      `key: ${sitemapKey}`,
      "",
      "Fix:",
      "  1) POST /api/projects/<projectId>/agents/seo-v2",
      "  2) POST /api/projects/<projectId>/agents/sitemap",
      "",
    ].join("\n");

    return new NextResponse(body, {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
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
