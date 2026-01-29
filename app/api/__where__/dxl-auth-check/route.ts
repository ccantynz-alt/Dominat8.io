import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function pick(obj: Record<string, any>, keys: string[]) {
  const out: Record<string, any> = {};
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== "") out[k] = obj[k];
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const env = process.env as Record<string, string | undefined>;

  const vercel = pick(env as any, [
    "VERCEL",
    "VERCEL_ENV",
    "VERCEL_REGION",
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_ID",
    "VERCEL_DEPLOYMENT_ID",
  ]);

  const git = pick(env as any, [
    "VERCEL_GIT_PROVIDER",
    "VERCEL_GIT_REPO_SLUG",
    "VERCEL_GIT_REPO_OWNER",
    "VERCEL_GIT_REPO_ID",
    "VERCEL_GIT_COMMIT_SHA",
    "VERCEL_GIT_COMMIT_REF",
    "VERCEL_GIT_COMMIT_MESSAGE",
  ]);

  const runtime = pick(env as any, [
    "NODE_VERSION",
    "NODE_ENV",
  ]);

  const headersObj: Record<string, string> = {};
  const wantHeaders = [
    "x-vercel-id",
    "x-matched-path",
    "x-vercel-cache",
    "x-forwarded-for",
    "x-forwarded-proto",
    "host",
    "user-agent",
  ];
  for (const h of wantHeaders) {
    const v = req.headers.get(h);
    if (v) headersObj[h] = v;
  }

  return NextResponse.json(
    {
      ok: true,
      stamp: "DXL_WHERE_PROOF_ENRICH_20260129",
      builtAt: "20260129_103347",
      at: new Date().toISOString(),
      path: url.pathname,
      qs: Object.fromEntries(url.searchParams.entries()),
      vercel,
      git,
      runtime,
      headers: headersObj,
      note: "Where-proof endpoint. Use this to confirm LIVE deploy + git SHA.",
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    }
  );
}