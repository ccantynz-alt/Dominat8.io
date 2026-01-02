import { getSeoPages } from "@/app/lib/seoKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const pages = await getSeoPages(params.projectId);

  const urls = pages
    .map(
      (p) =>
        `<url><loc>${process.env.NEXT_PUBLIC_BASE_URL}/site/${params.projectId}/${p.slug}</loc></url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
