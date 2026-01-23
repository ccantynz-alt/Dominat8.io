import type { NextApiRequest, NextApiResponse } from "next";

/**
 * DEPLOY PROOF ENDPOINT
 * Hit /api/__version__ on production to confirm what is deployed.
 *
 * Common Vercel env vars:
 * - VERCEL_ENV: "production" | "preview" | "development"
 * - VERCEL_URL: deployment hostname (no protocol)
 * - VERCEL_GIT_COMMIT_SHA: commit sha (Git deployments)
 * - VERCEL_GIT_COMMIT_REF: branch name (Git deployments)
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nowIso = new Date().toISOString();

  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    null;

  const gitRef =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    null;

  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || null;
  const vercelUrl = process.env.VERCEL_URL || null;

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    ok: true,
    nowIso,
    vercelEnv,
    vercelUrl,
    gitRef,
    gitSha,
    hint:
      "If gitSha is null, your deployment may be non-Git or env var not present. Still confirms the route is deployed.",
  });
}