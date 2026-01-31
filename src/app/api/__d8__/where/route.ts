/**
 * D8_TV_MONSTER_v1_20260131
 * /api/__d8__/where
 */

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const at = new Date().toISOString();
  const stamp = 'D8_TV_MONSTER_WHERE_20260131';

  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    '(unknown)';

  const path = u.pathname;

  return new Response(
    JSON.stringify({
      ok: true,
      stamp,
      at,
      host,
      path,
      note: 'Locator endpoint. If you see this JSON, the route exists on this deploy.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-d8-tv': 'where',
        'x-d8-stamp': stamp,
      },
    }
  );
}