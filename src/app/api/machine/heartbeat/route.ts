export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * NUCLEAR SAFE MODE: heartbeat disabled to keep builds green on Render/Vercel.
 * Not required for the public marketing site.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      mode: "heartbeat_disabled_safe_mode",
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
