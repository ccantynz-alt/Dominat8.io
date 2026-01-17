import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  // Robots is global. We keep it permissive for public published sites.
  // You can tighten later (e.g., disallow /api, /projects) — SEO engines will still crawl /p/*.
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    // Sitemap index (we serve a basic one here for now).
    // Later we can expand to include per-project sitemap indexes.
    "Sitemap: https://my-saas-app-5eyw.vercel.app/sitemap.xml",
    "",
  ];

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(lines.join("\n"));
}
