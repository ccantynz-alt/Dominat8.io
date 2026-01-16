// src/pages/api/projects/[projectId]/agents/auto-publish.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    route: "src/pages/api/projects/[projectId]/agents/auto-publish.ts",
    method: req.method,
    projectId: String(req.query.projectId || ""),
    time: new Date().toISOString(),
  });
}
