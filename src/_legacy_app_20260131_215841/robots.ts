import type { MetadataRoute } from "next";

/**
 * robots.txt (Next metadata route)
 * Marker: SEO_BASELINE_V1
 *
 * Notes:
 * - Allows indexing of marketing pages by default
 * - Disallows common non-public areas
 * - References sitemap.xml on the production domain
 */

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.dominat8.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/app/",
          "/preview/",
          "/dashboard/",
          "/admin/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}