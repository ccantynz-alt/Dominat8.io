import { kv } from "@vercel/kv";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

type SavedSiteMeta = { id: string; prompt: string; blobUrl: string; createdAt: string };

export async function GET() {
  const now = new Date().toISOString();
  const deployments: { domain: string; desc: string; status: string; pill: string; progress: number; icon: string; updatedAt: string }[] = [];

  try {
    const ids = await kv.lrange<string>("deployments:recent", 0, 49);
    const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dominat8.io";
    for (const id of ids || []) {
      const meta = await kv.get<SavedSiteMeta>(`site:${id}`);
      if (meta) {
        deployments.push({
          domain: `${origin}/s/${id}`,
          desc: meta.prompt || "Generated site",
          status: "LIVE",
          pill: "OK",
          progress: 100,
          icon: "rocket",
          updatedAt: meta.createdAt || now,
        });
      }
    }
  } catch {
    /* KV not configured - fall back to static */
  }

  if (deployments.length === 0) {
    deployments.push(
      { domain: "dominat8.io", desc: "Builder + TV cockpit", status: "LIVE", pill: "OK", progress: 100, icon: "rocket", updatedAt: now },
      { domain: "dominat8-engine", desc: "Agent engine API", status: "LIVE", pill: "OK", progress: 100, icon: "globe", updatedAt: now },
    );
  }

  return json({
    ok: true,
    stamp: `D8_IO_TV_DEPLOYMENTS_v2_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    at: now,
    count: deployments.length,
    deployments,
  });
}
