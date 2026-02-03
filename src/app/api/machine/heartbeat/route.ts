export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMP SAFE MODE: heartbeat disabled to keep build green.
 * This route is not required for the marketing site to render.
 * Restore full machine heartbeat after prod is live.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      heartbeat: "disabled_safe_mode",
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
