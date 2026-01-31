import type { MetadataRoute } from "next";

/**
 * sitemap.xml (Next metadata route)
 * Marker: SEO_BASELINE_V1
 *
 * Basic static sitemap (safe baseline).
 * Later we can add dynamic template pages, project pages, etc.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://www.dominat8.com";
  const now = new Date();

  const urls: Array<{ url: string; lastModified: Date; changeFrequency?: any; priority?: number }> = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Add more marketing pages here when they are stable:
    // { url: `${siteUrl}/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // { url: `${siteUrl}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  return urls;
}