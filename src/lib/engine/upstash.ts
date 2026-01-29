// AI_WEB_BUILDER_UPSTASH_HELPER_SRC_2026-01-29
export type UpstashConfig = { url?: string; token?: string };

function envGet(name: string): string | undefined {
  const v = process.env[name];
  return v ? v : undefined;
}

export function getUpstashConfig(): UpstashConfig {
  return {
    url: envGet("KV_REST_API_URL") || envGet("UPSTASH_REDIS_REST_URL"),
    token: envGet("KV_REST_API_TOKEN") || envGet("UPSTASH_REDIS_REST_TOKEN"),
  };
}

export async function kvGetText(key: string, cfg?: UpstashConfig): Promise<string | null> {
  const c = cfg ?? getUpstashConfig();
  if (!c.url || !c.token) {
    throw new Error("Missing KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).");
  }

  const base = c.url.replace(/\/+$/, "");
  const url = base + "/get/" + encodeURIComponent(key);

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${c.token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`KV GET failed: ${res.status} ${res.statusText} :: ${t}`);
  }

  const json: any = await res.json();
  const val = (json && typeof json.result !== "undefined") ? json.result : null;
  if (val === null || typeof val === "undefined") return null;
  if (typeof val === "string") return val;

  try { return JSON.stringify(val); } catch { return String(val); }
}