import { getSeoSettings } from "@/app/lib/seoSettingsKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const settings = await getSeoSettings(params.projectId);

  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  const sitemapUrl = `${base}/site/${params.projectId}/sitemap.xml`;

  // If indexing OFF: disallow everything
  if (settings.indexing === "off") {
    const txt = `User-agent: *
Disallow: /
Sitemap: ${sitemapUrl}
`;
    return new Response(txt, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // If indexing ON: allow everything
  const txt = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`;
  return new Response(txt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
