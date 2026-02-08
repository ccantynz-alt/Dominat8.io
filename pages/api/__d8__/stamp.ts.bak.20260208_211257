import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("pragma", "no-cache");
  res.setHeader("x-d8-proof", "D8_PAGES_STAMP_OK");
  res.status(200).json({
    ok: true,
    stamp: "D8_STAMP_2026-02-02_ROUTE_LANDING_PAD",
    now: new Date().toISOString(),
    via: "pages-api",
    vercel_git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercel_deploy_id: process.env.VERCEL_DEPLOYMENT_ID || null,
  });
}
