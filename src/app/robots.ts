import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/gallery", "/pricing", "/about", "/privacy", "/terms"],
        disallow: ["/api/", "/io/", "/cockpit/", "/tv/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://dominat8.io/sitemap.xml",
  };
}
