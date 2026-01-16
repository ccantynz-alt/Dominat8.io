import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    route: "pages-api-auto-publish",
    method: req.method,
    projectId: String(req.query.projectId || ""),
    time: new Date().toISOString(),
  });
}
