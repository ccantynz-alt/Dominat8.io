import { runGuard } from '../_guard';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const report = await runGuard(req.url);

  return new Response(
    JSON.stringify({
      ok: true,
      at: new Date().toISOString(),
      report,
      note: 'Manual guard trigger. Heartbeat also runs guard automatically.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-dominat8-machine': 'lmm1',
        'x-dominat8-guard': 'enabled',
      },
    }
  );
}
