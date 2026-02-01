export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  return new Response(JSON.stringify({ ok: true, now, via: "app-router" }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "x-d8-proof": "D8_APP_HEALTH_OK",
    },
  });
}
