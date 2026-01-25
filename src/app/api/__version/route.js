export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = {
    ok: true,
    marker: 'D8_DEPLOY_PROOF_2026-01-25T04-04-38Z',
    nowIso: new Date().toISOString(),
    vercel: {
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
      env: process.env.VERCEL_ENV || null,
      url: process.env.VERCEL_URL || null
    }
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0'
    }
  });
}
