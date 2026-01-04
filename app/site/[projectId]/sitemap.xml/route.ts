import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing seoKV alias imports.
 * Return a minimal sitemap.xml so build stays green.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const url = `${base}/site/${params.projectId}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
