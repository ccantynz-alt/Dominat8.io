// src/app/api/__probe__/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      source: "src/app/api/__probe__/route.ts",
      method: "GET",
      time: new Date().toISOString(),
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelUrl: process.env.VERCEL_URL || null,
      region: process.env.VERCEL_REGION || null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
