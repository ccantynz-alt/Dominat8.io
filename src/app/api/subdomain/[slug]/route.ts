/**
 * Handles subdomain routing: {slug}.dominat8.io
 * Middleware rewrites subdomain requests to /api/subdomain/{slug}
 * This route looks up the siteId from KV and serves the HTML.
 */
import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";
import type { SavedSiteMeta } from "../../sites/save/route";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug || slug.length > 50) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const siteId = await kv.get<string>(`domain:${slug}`);
    if (!siteId) return notFound(slug);

    const meta = await kv.get<SavedSiteMeta>(`site:${siteId}`);
    if (!meta?.blobUrl) return notFound(slug);

    // Fetch the HTML from Vercel Blob
    const res = await fetch(meta.blobUrl, { cache: "no-store" });
    if (!res.ok) return notFound(slug);

    const html = await res.text();

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        "X-D8-Site-Id": siteId,
        "X-D8-Slug": slug,
      },
    });
  } catch {
    return new Response("Error loading site", { status: 500 });
  }
}

function notFound(slug: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${slug} — Not Found on Dominat8.io</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;
      display:flex;align-items:center;justify-content:center;min-height:100vh}
    .c{text-align:center;padding:40px 24px}
    .n{font-size:80px;font-weight:900;background:linear-gradient(135deg,#F0B35A,#E8715A);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
    h1{font-size:28px;font-weight:700;margin-bottom:8px}
    p{color:rgba(245,240,235,0.45);margin-bottom:28px;font-size:16px}
    a{display:inline-block;padding:12px 28px;border-radius:12px;
      background:linear-gradient(135deg,rgba(240,179,90,0.2),rgba(232,113,90,0.2));
      border:1px solid rgba(240,179,90,0.35);color:rgba(240,179,90,0.95);
      text-decoration:none;font-weight:700;font-size:15px}
  </style>
</head>
<body>
  <div class="c">
    <div class="n">404</div>
    <h1>Site not found</h1>
    <p>${slug}.dominat8.io hasn't been claimed yet.<br>Build your own in under 30 seconds.</p>
    <a href="https://dominat8.io">Build a site free →</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
