export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const body = {
    ok: true,
    service: "dominat8",
    now,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "x-d8-proof": "D8_HEALTH_OK",
    },
  });
}
