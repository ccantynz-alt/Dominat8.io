export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * NUCLEAR SAFE MODE: execute route disabled to keep builds green.
 */
export async function GET(_req: Request) {
  return new Response(
    JSON.stringify({
      ok: true,
      mode: "execute_disabled_safe_mode",
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
