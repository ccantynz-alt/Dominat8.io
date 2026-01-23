import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    source: "pages/api/__fingerprint__.ts",
    fingerprint: "FINGERPRINT_my-saas-app_main_pages_api_2026-01-19_v1",
    nowIso: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    method: req.method,
  });
}
