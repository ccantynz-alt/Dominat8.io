export const dynamic = 'force-dynamic';
export const revalidate = 0;

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function GET() {
  const deployments = [
    { domain: 'dominat8.io', desc: 'TV cockpit', status: 'LIVE', pill: 'OK', progress: 92, icon: 'rocket' },
    { domain: 'dominat8-engine', desc: 'agent engine', status: 'READY', pill: 'OK', progress: 80, icon: 'globe' },
    { domain: 'repair-owner', desc: 'auto-repair worker', status: 'PENDING', pill: 'TODO', progress: 54, icon: 'bot' },
  ];

  return json({ ok: true, stamp: 'D8_IO_TV_FORCE_DEPLOY_011_20260205_080918', deployments });
}
