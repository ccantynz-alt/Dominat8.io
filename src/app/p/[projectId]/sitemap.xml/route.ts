export const runtime = "nodejs";

type Params = { projectId: string };

function getBaseUrl(req: Request) {
  // Prefer forwarded headers on Vercel
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";

  const proto = req.headers.get("x-forwarded-proto") || "https";

  return `${proto}://${host}`;
}

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(
  req: Request,
  ctx: { params: Params }
): Promise<Response> {
  const { projectId } = ctx.params;
  const base = getBaseUrl(req);

  // ✅ Real multi-page routes we support right now
  const pages = ["", "about", "pricing", "faq", "contact"];

  const urls = pages.map((slug) => {
    const path = slug ? `/p/${projectId}/${slug}` : `/p/${projectId}`;
    return `${base}${path}`;
  });

  const now = new Date().toISOString();

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((loc) => {
        return (
          `<url>` +
          `<loc>${xmlEscape(loc)}</loc>` +
          `<lastmod>${xmlEscape(now)}</lastmod>` +
          `</url>`
        );
      })
      .join("") +
    `</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
