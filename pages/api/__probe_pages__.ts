import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({
    ok: true,
    router: "pages",
    file: "pages/api/__probe_pages__.ts",
    method: req.method,
    url: req.url,
    nowIso: new Date().toISOString(),
  });
}
