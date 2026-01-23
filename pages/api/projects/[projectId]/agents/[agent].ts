import type { NextApiRequest, NextApiResponse } from "next";

/**
 * AGENT ROUTER (CATCH-ALL)
 * Goal: Always return JSON and allow POST/GET.
 * Dispatches to known agent endpoints.
 *
 * IMPORTANT:
 * - If a dedicated file exists (seo.ts, sitemap.ts, seo-v2.ts, pipeline.ts, launch-run.ts),
 *   Next should route there first.
 * - If this catch-all is intercepting, we explicitly dispatch here.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { projectId, agent } = req.query;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ ok: false, error: "Missing projectId", source: "[agent].ts" });
  }

  if (!agent || typeof agent !== "string") {
    return res.status(400).json({ ok: false, error: "Missing agent", source: "[agent].ts" });
  }

  // Allow POST + GET for agents (agents are command endpoints)
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
      allowed: ["GET", "POST"],
      agent,
      projectId,
      source: "pages/api/projects/[projectId]/agents/[agent].ts",
    });
  }

  try {
    if (agent === "seo") {
      const mod = await import("./seo");
      return mod.default(req, res);
    }

    if (agent === "seo-v2") {
      const mod = await import("./seo-v2");
      return mod.default(req, res);
    }

    if (agent === "sitemap") {
      const mod = await import("./sitemap");
      return mod.default(req, res);
    }

    if (agent === "pipeline") {
      const mod = await import("./pipeline");
      return mod.default(req, res);
    }

    if (agent === "launch-run") {
      const mod = await import("./launch-run");
      return mod.default(req, res);
    }

    return res.status(404).json({
      ok: false,
      error: "Unknown agent",
      agent,
      projectId,
      source: "pages/api/projects/[projectId]/agents/[agent].ts",
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "Agent dispatch failed",
      agent,
      projectId,
      details: String(e?.message || e),
      source: "pages/api/projects/[projectId]/agents/[agent].ts",
    });
  }
}
