import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@/lib/kv";

/**
 * PLATFORM SEO AGENT
 * - Authoritative SEO source for the AI Website Builder platform
 * - MUST accept POST
 * - MUST always return JSON
 * - MUST serialize before KV write
 */

type SeoPlan = {
  version: 1;
  generatedAtIso: string;

  site: {
    brand: string;
    domain: string | null;
    language: string;
    country: string;
  };

  primaryKeywords: string[];
  secondaryKeywords: string[];

  pages: Array<{
    slug: string;
    title: string;
    description: string;
    h1: string;
    keywords: string[];
    intent: "transactional" | "informational" | "navigational";
    canonical: string | null;
  }>;

  sitemap: {
    include: string[];
    exclude: string[];
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ALWAYS respond as JSON (prevents empty HTML 405 responses)
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { projectId } = req.query;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Missing projectId",
      source: "pages/api/projects/[projectId]/agents/seo.ts",
    });
  }

  // ✅ ALLOW POST (real execution) + GET (probe)
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      agent: "seo",
      projectId,
      error: "Method not allowed",
      allowed: ["GET", "POST"],
      source: "pages/api/projects/[projectId]/agents/seo.ts",
    });
  }

  const nowIso = new Date().toISOString();

  const plan: SeoPlan = {
    version: 1,
    generatedAtIso: nowIso,

    site: {
      brand: "AI Website Builder",
      domain: null,
      language: "en",
      country: "global",
    },

    primaryKeywords: [
      "ai website builder",
      "ai website automation",
      "build a website with ai",
      "ai powered website builder",
      "automated website builder",
    ],

    secondaryKeywords: [
      "generate website with ai",
      "publish website automatically",
      "ai landing page generator",
      "programmatic seo builder",
      "ai web development platform",
    ],

    pages: [
      {
        slug: "/",
        title: "AI Website Builder — Build, Publish & Scale Websites Automatically",
        description:
          "Build complete websites from start to finish using AI. Generate pages, publish instantly, and scale with automation.",
        h1: "Build Websites Automatically With AI",
        keywords: ["ai website builder", "ai website automation"],
        intent: "transactional",
        canonical: null,
      },
      {
        slug: "/ai-website-builder",
        title: "AI Website Builder Platform",
        description:
          "An AI-powered platform to generate, publish, and manage complete websites with minimal human input.",
        h1: "AI Website Builder Platform",
        keywords: ["ai website builder", "automated website builder"],
        intent: "transactional",
        canonical: null,
      },
      {
        slug: "/features",
        title: "AI Website Automation Features",
        description:
          "Explore features that automate website creation, publishing, SEO, and scaling using AI agents.",
        h1: "Website Automation Features",
        keywords: ["website automation", "ai website features"],
        intent: "informational",
        canonical: null,
      },
      {
        slug: "/use-cases/developers",
        title: "AI Website Builder for Developers",
        description:
          "Developers use this AI website builder to automate site creation, deployment, and SEO workflows.",
        h1: "AI Website Builder for Developers",
        keywords: ["ai website builder for developers"],
        intent: "informational",
        canonical: null,
      },
      {
        slug: "/use-cases/founders",
        title: "AI Website Builder for Founders",
        description:
          "Founders launch faster by letting AI handle website creation, publishing, and SEO.",
        h1: "Launch Faster With AI",
        keywords: ["ai website builder for startups"],
        intent: "informational",
        canonical: null,
      },
      {
        slug: "/programmatic-seo",
        title: "Programmatic SEO With AI",
        description:
          "Generate and scale SEO pages automatically using AI-driven programmatic SEO.",
        h1: "Programmatic SEO Powered by AI",
        keywords: ["programmatic seo", "ai seo automation"],
        intent: "informational",
        canonical: null,
      },
    ],

    sitemap: {
      include: [
        "/",
        "/ai-website-builder",
        "/features",
        "/programmatic-seo",
        "/use-cases/developers",
        "/use-cases/founders",
      ],
      exclude: [],
    },
  };

  const key = `project:${projectId}:seoPlan`;

  // ✅ MUST serialize before KV write
  await kv.set(key, JSON.stringify(plan));

  return res.status(200).json({
    ok: true,
    agent: "seo",
    projectId,
    generatedAtIso: nowIso,
    artifactKey: key,
    pages: plan.pages.length,
    source: "pages/api/projects/[projectId]/agents/seo.ts",
    method: req.method,
  });
}
