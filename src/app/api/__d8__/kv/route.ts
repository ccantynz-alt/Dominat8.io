/**
 * D8_TV_CHANNELS_v1_20260201a
 * /api/__d8__/kv
 * Reports whether KV-related env vars exist (presence only).
 */
export const runtime = 'nodejs';

function has(name: string) {
  const v = process.env[name];
  return !!(v && String(v).trim().length > 0);
}

export async function GET(req: Request) {
  const at = new Date().toISOString();
  const stamp = 'D8_TV_CHANNELS_KV_20260201a';

  const presence = {
    KV_REST_API_URL: has('KV_REST_API_URL'),
    KV_REST_API_TOKEN: has('KV_REST_API_TOKEN'),
    UPSTASH_REDIS_REST_URL: has('UPSTASH_REDIS_REST_URL'),
    UPSTASH_REDIS_REST_TOKEN: has('UPSTASH_REDIS_REST_TOKEN'),
    UPSTASH_REDIS_URL: has('UPSTASH_REDIS_URL'),
    UPSTASH_REDIS_TOKEN: has('UPSTASH_REDIS_TOKEN'),
  };

  return new Response(
    JSON.stringify({
      ok: true,
      stamp,
      at,
      presence,
      note: 'Presence-only KV env proof. No secrets returned.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-d8-tv': 'kv',
        'x-d8-stamp': stamp,
      },
    }
  );
}