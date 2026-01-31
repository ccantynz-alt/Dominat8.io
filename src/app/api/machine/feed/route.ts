import { getFeed } from '../_feed';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const limit = Math.max(1, Math.min(50, Number(u.searchParams.get('limit') || 10)));

  return new Response(
    JSON.stringify({
      ok: true,
      at: new Date().toISOString(),
      events: getFeed(limit),
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-dominat8-machine': 'lmm1',
      },
    }
  );
}