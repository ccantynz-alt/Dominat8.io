import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/projects/", "/runs/"],
    },
    sitemap: "https://my-saas-app-5eyw.vercel.app/sitemap.xml",
  };
}
