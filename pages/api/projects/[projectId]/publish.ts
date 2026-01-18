import type { NextApiRequest, NextApiResponse } from "next";

/**
 * PUBLISH SHIM
 *
 * This file exists ONLY so Pages API agents (e.g. finish-for-me)
 * can import "../publish" without breaking the Vercel build.
 *
 * The real publish implementation lives in:
 *   app/api/projects/[projectId]/publish/route.ts
 *
 * This shim forwards the request to that handler.
 */

export default async function publishShim(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Lazy import to avoid edge/runtime conflicts
  const mod = await import("../../../../app/api/projects/[projectId]/publish/route");

  // App Router handlers export POST (and sometimes GET)
  if (typeof mod.POST === "function") {
    return mod.POST(req as any, res as any);
  }

  return res.status(500).json({
    ok: false,
    error: "Publish handler not found",
    source: "pages/api/projects/[projectId]/publish.ts",
  });
}
