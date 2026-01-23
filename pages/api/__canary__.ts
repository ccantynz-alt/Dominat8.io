import type { NextApiRequest, NextApiResponse } from "next";

export default function canary(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    marker: "CANON_CANARY_pages_api_v1_2026-01-19",
    method: req.method,
    nowIso: new Date().toISOString(),
  });
}

