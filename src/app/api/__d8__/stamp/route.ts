/**
 * D8_TV_MONSTER_v1_20260131
 * /api/__d8__/stamp
 */

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const at = new Date().toISOString();
  const stamp = 'D8_TV_MONSTER_STAMP_20260131';
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown';

  // NOTE: keep response stable + cache-safe
  return new Response(
    JSON.stringify({
      ok: true,
      stamp,
      at,
      env,
      node: process.version,
      note: 'D8 TV stamp endpoint for dev/prod proof.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-d8-tv': 'stamp',
        'x-d8-stamp': stamp,
      },
    }
  );
}