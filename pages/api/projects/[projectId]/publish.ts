import type { NextApiRequest, NextApiResponse } from "next";

/**
 * PUBLISH SHIM (Pages API)
 *
 * Pages API agents import "../publish" from:
 *   pages/api/projects/[projectId]/agents/*
 *
 * The real publish implementation lives in:
 *   BOOTSTRAP/app/api/projects/[projectId]/publish/route.ts
 *
 * This shim forwards the request to that handler.
 */

export default async function publishShim(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mod = await import(
    "../../../../BOOTSTRAP/app/api/projects/[projectId]/publish/route"
  );

  if (typeof (mod as any).POST === "function") {
    return (mod as any).POST(req as any, res as any);
  }

  return res.status(500).json({
    ok: false,
    error: "Publish handler not found",
    source: "pages/api/projects/[projectId]/publish.ts",
  });
}
