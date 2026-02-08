import { NextResponse } from "next/server";

export const runtime = "nodejs";

function noCacheHeaders() {
  return {
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
  } as Record<string, string>;
}

export async function GET(req: Request) {
  const now = new Date().toISOString();
  const env = process.env.VERCEL_ENV || "unknown";
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "unknown";
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "unknown";

  const body = {
    ok: true,
    service: "dominat8.io",
    route: "/api/tv/status",
    now,
    env,
    branch,
    commit: (commit || "").substring(0, 12),
  };

  return NextResponse.json(body, { headers: noCacheHeaders() });
}