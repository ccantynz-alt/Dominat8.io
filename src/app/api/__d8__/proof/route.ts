/**
 * D8_TV_CHANNELS_v1_20260201a
 * /api/__d8__/proof
 * "What deploy am I on?" proof payload (no secrets)
 */
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const at = new Date().toISOString();
  const stamp = 'D8_TV_CHANNELS_PROOF_20260201a';

  const vercel = {
    env: process.env.VERCEL_ENV || null,
    url: process.env.VERCEL_URL || null,
    region: process.env.VERCEL_REGION || null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
  };

  const node = {
    version: process.version,
  };

  const hdr = (name: string) => req.headers.get(name) || null;
  const headers = {
    host: hdr('host'),
    xForwardedHost: hdr('x-forwarded-host'),
    xForwardedProto: hdr('x-forwarded-proto'),
    xForwardedFor: hdr('x-forwarded-for'),
    userAgent: hdr('user-agent'),
  };

  return new Response(
    JSON.stringify({
      ok: true,
      stamp,
      at,
      vercel,
      node,
      headers,
      note: 'Deploy/env/region proof endpoint for D8 TV.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-d8-tv': 'proof',
        'x-d8-stamp': stamp,
      },
    }
  );
}