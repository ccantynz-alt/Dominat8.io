import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    null;

  const gitRef =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    null;

  return NextResponse.json({
    ok: true,
    source: "app/api/__probe__/route.ts",
    nowIso: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    region: process.env.VERCEL_REGION || null,
    gitSha,
    gitRef,
  });
}

