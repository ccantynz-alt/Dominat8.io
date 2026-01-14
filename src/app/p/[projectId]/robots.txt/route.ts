export const runtime = "nodejs";

type Params = { projectId: string };

function getBaseUrl(req: Request) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";

  const proto = req.headers.get("x-forwarded-proto") || "https";

  return `${proto}://${host}`;
}

export async function GET(
  req: Request,
  ctx: { params: Params }
): Promise<Response> {
  const { projectId } = ctx.params;
  const base = getBaseUrl(req);

  const sitemapUrl = `${base}/p/${projectId}/sitemap.xml`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
