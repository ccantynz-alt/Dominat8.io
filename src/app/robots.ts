import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/gallery", "/pricing"],
        disallow: ["/api/", "/io/", "/tv/"],
      },
    ],
    sitemap: "https://dominat8.io/sitemap.xml",
  };
}
