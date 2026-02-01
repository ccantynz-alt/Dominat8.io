/* ===== D8_COMMAND_CORE_V1_20260131_184330 =====
   GET /api/command/events
   Mock event stream (safe, no external dependencies).
   Next step: wire to real agent runs + KV.
*/
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isoMinutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export async function GET() {
  const stamp = 'D8_COMMAND_CORE_V1_20260131_184330';
  const proof = 'D8_CC_V1_PROOF_20260131_184330';

  // Mock events (kept intentionally "realistic" for perceived motion).
  const events = [
    {
      id: 'e1',
      ts: isoMinutesAgo(2),
      kind: 'seo',
      title: 'SEO Agent refreshed homepage meta',
      detail: 'Updated title/description + canonical consistency checks',
      ok: true,
    },
    {
      id: 'e2',
      ts: isoMinutesAgo(7),
      kind: 'content',
      title: 'Content Agent drafted a new landing section',
      detail: 'Prepared copy blocks for services + trust strip',
      ok: true,
    },
    {
      id: 'e3',
      ts: isoMinutesAgo(14),
      kind: 'sitemap',
      title: 'Sitemap regenerated',
      detail: 'Ensured route discovery consistency and freshness signals',
      ok: true,
    },
    {
      id: 'e4',
      ts: isoMinutesAgo(28),
      kind: 'links',
      title: 'Internal link graph pass',
      detail: 'Suggested 3 cross-links between key pages',
      ok: true,
    },
  ];

  const res = NextResponse.json({
    ok: true,
    stamp,
    proof,
    at: new Date().toISOString(),
    events,
    note: 'Mock stream installed. Wire to real agent runs next (KV event ledger).',
  });

  res.headers.set('x-dominat8-command-core', 'v1');
  res.headers.set('x-dominat8-build-stamp', stamp);
  res.headers.set('x-dominat8-proof', proof);
  res.headers.set('cache-control', 'no-store, max-age=0');
  return res;
}