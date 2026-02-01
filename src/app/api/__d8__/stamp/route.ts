export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safe(v: unknown) {
  return typeof v === "string" && v.length ? v : null;
}

export async function GET() {
  const now = new Date();
  const iso = now.toISOString();

  const body = {
    ok: true,
    stamp: "D8_STAMP_2026-02-02_STRUCTURAL_RESET",
    time_iso: iso,
    vercel_git_commit_sha: safe(process.env.VERCEL_GIT_COMMIT_SHA),
    vercel_deploy_id: safe(process.env.VERCEL_DEPLOYMENT_ID),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "x-d8-proof": "D8_STAMP_OK",
    },
  });
}
