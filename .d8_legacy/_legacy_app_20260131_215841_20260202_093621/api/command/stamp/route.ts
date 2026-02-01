/* ===== D8_COMMAND_CORE_V1_1_REAL_EVENTS_20260131_185240 =====
   GET /api/command/stamp
   Returns proof-of-life stamp + KV configured signal.
*/
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return { url, token, ok: Boolean(url && token) };
}

export async function GET() {
  const stamp = 'D8_COMMAND_CORE_V1_1_REAL_EVENTS_20260131_185240';
  const proof = 'D8_CC_V1_1_PROOF_20260131_185240';
  const at = new Date().toISOString();
  const kv = getKvConfig();

  const res = NextResponse.json({
    ok: true,
    stamp,
    proof,
    at,
    path: '/api/command/stamp',
    kvConfigured: kv.ok
  });

  res.headers.set('x-dominat8-command-core', 'v1.1');
  res.headers.set('x-dominat8-build-stamp', stamp);
  res.headers.set('x-dominat8-proof', proof);
  res.headers.set('x-dominat8-kv', kv.ok ? 'configured' : 'missing');
  res.headers.set('cache-control', 'no-store, max-age=0');
  return res;
}