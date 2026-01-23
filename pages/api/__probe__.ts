import type { NextApiRequest, NextApiResponse } from "next";

export default function probe(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    source: "pages/api/__probe__.ts",
    method: req.method,
    nowIso: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelRegion: process.env.VERCEL_REGION || null,
    gitSha:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_REF ||
      null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
  });
}
