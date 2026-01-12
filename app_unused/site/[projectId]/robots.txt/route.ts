import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This route depended on missing seoSettingsKV alias imports.
 * Return a basic robots.txt so build stays green.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const body = `User-agent: *
Allow: /

Sitemap: /site/${params.projectId}/sitemap.xml
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
