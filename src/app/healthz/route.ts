export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    ok: true,
    service: "dominat8.io",
    now: new Date().toISOString(),
    stamp: "D8_IO_HEALTHZ_20260205_085457"
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache"
    }
  });
}
