export const dynamic = 'force-dynamic';
export const revalidate = 0;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function GET() {
  const now = new Date().toISOString();

  const deployments = [
    {
      domain: 'dominat8.io',
      desc: 'Builder + TV cockpit',
      status: 'LIVE',
      pill: 'OK',
      progress: 100,
      icon: 'rocket',
      updatedAt: now,
    },
    {
      domain: 'dominat8-engine',
      desc: 'Agent engine API',
      status: 'LIVE',
      pill: 'OK',
      progress: 100,
      icon: 'globe',
      updatedAt: now,
    },
    {
      domain: 'repair-owner',
      desc: 'Auto-repair worker',
      status: 'LIVE',
      pill: 'OK',
      progress: 100,
      icon: 'bot',
      updatedAt: now,
    },
  ];

  return json({
    ok: true,
    stamp: `D8_IO_TV_DEPLOYMENTS_v2_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    at: now,
    count: deployments.length,
    deployments,
  });
}
