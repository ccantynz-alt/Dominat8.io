import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getEnv() {
  const env = process.env;

  const deployId =
    env.VERCEL_DEPLOYMENT_ID ||
    env.VERCEL_DEPLOYMENT_URL ||
    env.VERCEL_URL ||
    "";

  const gitSha =
    env.VERCEL_GIT_COMMIT_SHA ||
    env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    env.GIT_COMMIT_SHA ||
    "";

  const gitRef =
    env.VERCEL_GIT_COMMIT_REF ||
    env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    env.GIT_BRANCH ||
    "";

  const nodeEnv = env.NODE_ENV || "";
  const vercelEnv = env.VERCEL_ENV || "";

  return { deployId, gitSha, gitRef, nodeEnv, vercelEnv };
}

export async function GET() {
  const nowIso = new Date().toISOString();
  const stamp = `PROBE_${nowIso.replace(/[-:.TZ]/g, "")}`;

  const env = getEnv();

  const body = {
    ok: true,
    nowIso,
    stamp,
    ...env,
  };

  const res = NextResponse.json(body, { status: 200 });

  // Strong "no cache" headers
  res.headers.set("cache-control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("pragma", "no-cache");
  res.headers.set("expires", "0");
  res.headers.set("surrogate-control", "no-store");

  // Proof headers (easy to grep)
  res.headers.set("x-dominat8-probe", "1");
  res.headers.set("x-dominat8-stamp", stamp);
  if (env.gitSha) res.headers.set("x-dominat8-git-sha", env.gitSha);
  if (env.gitRef) res.headers.set("x-dominat8-git-ref", env.gitRef);
  if (env.deployId) res.headers.set("x-dominat8-deploy", env.deployId);
  if (env.vercelEnv) res.headers.set("x-dominat8-vercel-env", env.vercelEnv);

  return res;
}