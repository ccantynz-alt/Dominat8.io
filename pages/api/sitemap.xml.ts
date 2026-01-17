import type { NextApiRequest, NextApiResponse } from "next";

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers.host as string) ||
    "my-saas-app-5eyw.vercel.app";

  const proto = ((req.headers["x-forwarded-proto"] as string) || "https").split(",")[0].trim();
  const base = `${proto}://${host}`;

  const urls = [
    `${base}/`,
    `${base}/projects`,
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`)
      .join("\n") +
    `\n</urlset>\n`;

  res.status(200);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(body);
}
