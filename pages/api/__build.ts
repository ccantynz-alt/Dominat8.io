import type { NextApiRequest, NextApiResponse } from "next";
const MARKER = "D8_BUILD_PROBE_v1_2026-01-23";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    marker: MARKER,
    nowIso: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
  });
}
