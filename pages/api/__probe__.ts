// pages/api/__probe__.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    source: "pages/api/__probe__.ts",
    method: req.method,
    time: new Date().toISOString(),
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    region: process.env.VERCEL_REGION || null,
  });
}
