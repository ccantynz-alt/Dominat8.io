// pages/api/__probe_debug_spec__.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    source: "pages/api/__probe_debug_spec__.ts",
    method: req.method,
    nowIso: new Date().toISOString(),
  });
}
