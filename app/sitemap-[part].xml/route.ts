// src/app/sitemap-[part].xml/route.ts
import { NextResponse } from "next/server";
import { kv } from "@/src/app/lib/kv";

export const dynamic = "force-dynamic";

function getHost(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  return host.split(",")[0].trim().toLowerCase();
}

function parsePart(partRaw: string | undefined): number | null {
  const s = String(partRaw || "").trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0 || n > 1000) return null;
  return n;
}

export async function GET(req: Request, ctx: { params: { part?: string } }) {
  const url = new URL(req.url);

  const explicit = (url.searchParams.get("projectId") || "").trim();
  const host = getHost(req);

  let projectId = explicit;

  if (!projectId && host) {
    const mapped = await kv.get(`domain:${host}:projectId`).catch(() => null);
    if (mapped) projectId = String(mapped).trim();
  }

  const n = parsePart(ctx?.params?.part);
  if (!n) {
    return new NextResponse("Invalid sitemap part.\n", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (!projectId) {
    const body = [
      "Missing projectId for sitemap part.",
      "",
      `Requested part: ${n}`,
      "",
      "Fix:",
      "  Map host to projectId (recommended), or use ?projectId=...",
      "",
      `Detected host: ${host || "(none)"}`,
      "",
    ].join("\n");

    return new NextResponse(body, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const partKey = `project:${projectId}:sitemapPartXml:${n}`;
  const xml = await kv.get(partKey).catch(() => null);

  if (!xml || !String(xml).trim()) {
    const body = [
      "Sitemap part not found.",
      "",
      `projectId: ${projectId}`,
      `key: ${partKey}`,
      "",
      "Fix:",
      "  POST /api/projects/<projectId>/agents/sitemap",
      "",
    ].join("\n");

    return new NextResponse(body, {
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
