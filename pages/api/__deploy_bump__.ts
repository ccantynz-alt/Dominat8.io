// pages/api/__deploy_bump__.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    source: "pages/api/__deploy_bump__.ts",
    nowIso: new Date().toISOString(),
  });
}
