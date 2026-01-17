import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@/lib/kv";

type SeoPlan = {
  version: 2;
  generatedAtIso: string;
  site: { brand: string; domain: string | null; language: string; country: string };
  pages: Array<{ slug: string; title: string; description: string; h1: string }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { projectId } = req.query;
  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ ok: false, error: "Missing projectId", source: "seo-v2" });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      agent: "seo-v2",
      projectId,
      error: "Method not allowed",
      allowed: ["GET", "POST"],
      source: "pages/api/projects/[projectId]/agents/seo-v2.ts",
    });
  }

  const nowIso = new Date().toISOString();

  const plan: SeoPlan = {
    version: 2,
    generatedAtIso: nowIso,
    site: { brand: "AI Website Builder", domain: null, language: "en", country: "global" },
    pages: [
      { slug: "/", title: "AI Website Builder", description: "Build, publish, and scale websites with AI.", h1: "Build Websites With AI" },
      { slug: "/programmatic-seo", title: "Programmatic SEO", description: "Scale landing pages with AI agents.", h1: "Programmatic SEO with AI" },
    ],
  };

  const key = `project:${projectId}:seoPlan`;
  await kv.set(key, JSON.stringify(plan));

  return res.status(200).json({
    ok: true,
    agent: "seo-v2",
    projectId,
    artifactKey: key,
    nowIso,
    source: "pages/api/projects/[projectId]/agents/seo-v2.ts",
  });
}

