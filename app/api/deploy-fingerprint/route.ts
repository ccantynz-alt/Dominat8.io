// app/api/deploy-fingerprint/route.ts
import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";

export async function GET() {
  // This is safe to expose: it does not include secrets.
  const hasZrange = typeof (kv as any).zrange === "function";
  const hasSmembers = typeof (kv as any).smembers === "function";
  const hasSadd = typeof (kv as any).sadd === "function";

  return NextResponse.json({
    ok: true,
    vercelEnv: process.env.VERCEL_ENV || null,
    nodeEnv: process.env.NODE_ENV || null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercelGitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
    kvShape: {
      hasZrange,
      hasSmembers,
      hasSadd,
      keys: Object.keys(kv).sort(),
    },
  });
}
