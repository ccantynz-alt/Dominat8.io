export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const body = {
    ok: true,
    stamp: "D8_STAMP_2026-02-02_ROUTE_LANDING_PAD",
    now,
    via: "app-router",
    vercel_git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercel_deploy_id: process.env.VERCEL_DEPLOYMENT_ID || null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "x-d8-proof": "D8_APP_STAMP_OK",
    },
  });
}
