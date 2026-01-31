type Json = any;

function kvBase() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) throw new Error("Missing KV env (KV_REST_API_URL+KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL+UPSTASH_REDIS_REST_TOKEN).");
  return { url, tok };
}

export async function kvGetJson<T = Json>(key: string): Promise<T | null> {
  const { url, tok } = kvBase();
  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${tok}` },
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  const v = j?.result;
  if (v === null || typeof v === "undefined") return null;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return v as any; }
  }
  return v as T;
}

export async function kvSetJson(key: string, value: Json): Promise<void> {
  const { url, tok } = kvBase();
  const payload = typeof value === "string" ? value : JSON.stringify(value);
  const r = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`KV set failed (${r.status}): ${t.slice(0, 300)}`);
  }
}

export function d8Key_agentLatest(projectId: string) {
  return `agentRun:project:${projectId}:latest`;
}
export function d8Key_agentRun(projectId: string, runId: string) {
  return `agentRun:project:${projectId}:${runId}`;
}
export function d8Key_bundleLatest(projectId: string) {
  return `bundleRun:project:${projectId}:latest`;
}
export function d8Key_bundleRun(projectId: string, runId: string) {
  return `bundleRun:project:${projectId}:${runId}`;
}
export function d8Key_patchLatest(projectId: string) {
  return `agentPatch:project:${projectId}:latest`;
}

/**
 * Stable KV key helper (compat export).
 * Used by: /projects/[projectId]/video
 * Keep this name stable to avoid build breaks.
 */
export function projectVideoKey(projectId: string): string {
  return `project:${projectId}:video`;
}

