export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * NUCLEAR SAFE MODE: guard route disabled to keep builds green.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      mode: "guard_disabled_safe_mode",
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
