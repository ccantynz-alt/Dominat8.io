import { runGuard } from '../_guard';
import { executeSafe } from '../_execute';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const guard = await runGuard(req.url);
  const exec = await executeSafe(req, guard);

  return new Response(
    JSON.stringify({
      ok: true,
      at: new Date().toISOString(),
      guard,
      exec,
      note: 'SAFE executor. Runs only when guard.degraded is true.',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-dominat8-machine': 'lmm1',
        'x-dominat8-exec': 'safe',
      },
    }
  );
}
