import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    null;

  res.status(200).json({
    ok: true,
    nowIso: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || null,
    gitSha,
    note: "If gitSha is null, set env VERCEL_GIT_COMMIT_SHA via Vercel’s built-in env or use Vercel-provided vars.",
    source: "pages/api/__deploy__.ts",
  });
}
