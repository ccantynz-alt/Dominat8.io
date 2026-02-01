export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function present(name: string) {
  const v = process.env[name];
  return !!(typeof v === "string" && v.length);
}

export async function GET() {
  const body = {
    ok: true,
    stamp: "D8_ENV_2026-02-02_ROUTE_LANDING_PAD",
    now: new Date().toISOString(),
    via: "app-router",
    present: {
      NODE_ENV: present("NODE_ENV"),
      VERCEL: present("VERCEL"),
      VERCEL_ENV: present("VERCEL_ENV"),
      VERCEL_URL: present("VERCEL_URL"),
      NEXT_PUBLIC_SITE_URL: present("NEXT_PUBLIC_SITE_URL"),
      OPENAI_API_KEY: present("OPENAI_API_KEY"),
      ADMIN_API_KEY: present("ADMIN_API_KEY"),
    },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
      "x-d8-proof": "D8_APP_ENV_OK",
    },
  });
}
