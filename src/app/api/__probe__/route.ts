import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const marker = "DEPLOY_PROBE_FORCE__2026-01-25T00:00:00Z";
  const nowIso = new Date().toISOString();
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || null;

  const res = NextResponse.json({ ok: true, marker, nowIso, gitSha });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}
