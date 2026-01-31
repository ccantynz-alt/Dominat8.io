/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   Upstash KV REST helper for Marketing Machine Core.
   Env: KV_REST_API_URL, KV_REST_API_TOKEN
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/

export type KvOk<T> = { ok: true; value: T };
export type KvErr = { ok: false; error: string; hint?: string };
export type KvRes<T> = KvOk<T> | KvErr;

function envMissing(): KvErr {
  return { ok: false, error: "KV env missing", hint: "Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel + .env.local" };
}

function getEnv() {
  const url = process.env.KV_REST_API_URL || "";
  const token = process.env.KV_REST_API_TOKEN || "";
  return { url, token };
}

async function kvFetch(body: any): Promise<any> {
  const { url, token } = getEnv();
  if (!url || !token) throw new Error("KV env missing");

  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) throw new Error("KV request failed: " + res.status + " " + (json?.error || text));
  return json;
}

export async function kvGet<T = any>(key: string): Promise<KvRes<T | null>> {
  try {
    const { url, token } = getEnv();
    if (!url || !token) return envMissing();
    const json = await kvFetch({ command: ["GET", key] });
    return { ok: true, value: (json?.result ?? null) as T | null };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function kvSet(key: string, value: any): Promise<KvRes<"OK">> {
  try {
    const { url, token } = getEnv();
    if (!url || !token) return envMissing();
    const json = await kvFetch({ command: ["SET", key, JSON.stringify(value)] });
    return { ok: true, value: (json?.result ?? "OK") as "OK" };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function kvLpush(key: string, value: any): Promise<KvRes<number>> {
  try {
    const { url, token } = getEnv();
    if (!url || !token) return envMissing();
    const json = await kvFetch({ command: ["LPUSH", key, JSON.stringify(value)] });
    return { ok: true, value: Number(json?.result ?? 0) };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function kvLrange<T = any>(key: string, start: number, stop: number): Promise<KvRes<T[]>> {
  try {
    const { url, token } = getEnv();
    if (!url || !token) return envMissing();
    const json = await kvFetch({ command: ["LRANGE", key, String(start), String(stop)] });
    const arr = Array.isArray(json?.result) ? json.result : [];
    const parsed = arr.map((x: any) => {
      if (typeof x === "string") { try { return JSON.parse(x); } catch { return x; } }
      return x;
    });
    return { ok: true, value: parsed as T[] };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}