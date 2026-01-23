export const config = {
  runtime: "edge",
};

const MARKER = "RELEASE2D_edge_probe_v1_2026-01-23";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function normalizeDomain(raw: string) {
  const s = (raw || "").trim().toLowerCase();
  // Strip protocol if someone passes https://example.com
  const noProto = s.replace(/^https?:\/\//, "");
  // Strip path/query fragments
  const noPath = noProto.split("/")[0] || "";
  // Strip port
  return noPath.split(":")[0] || "";
}

function safeHostFromUrl(urlStr: string) {
  try {
    return new URL(urlStr).host;
  } catch {
    return null;
  }
}

async function upstashGetString(key: string) {
  const restUrl = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  const env = {
    hasRestUrl: !!restUrl,
    hasRestToken: !!token,
    restUrlHost: restUrl ? safeHostFromUrl(restUrl) : null,
  };

  if (!env.hasRestUrl || !env.hasRestToken) {
    return { ok: false as const, env, key, error: "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN" };
  }

  // Upstash REST: GET <REST_URL>/get/<key>
  // Key must be URL encoded.
  const url = restUrl.replace(/\/+$/, "") + "/get/" + encodeURIComponent(key);

  let resp: Response;
  let text: string;

  try {
    resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Edge fetch caches can be surprising; force no-store
      cache: "no-store",
    });
    text = await resp.text();
  } catch (e: any) {
    return {
      ok: false as const,
      env,
      key,
      url,
      fetchError: e?.message || String(e),
    };
  }

  // Upstash returns JSON like: { "result": "value" } or { "result": null }
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {}

  const result = parsed?.result;

  return {
    ok: resp.ok,
    env,
    key,
    url,
    upstashStatus: resp.status,
    upstashOk: resp.ok,
    upstashBodyType: typeof parsed,
    rawFirst200: text ? String(text).slice(0, 200) : "",
    result: (result === undefined ? null : result),
  };
}

export default async function handler(req: Request) {
  const u = new URL(req.url);
  const domainParam = u.searchParams.get("domain") || "";
  const domain = normalizeDomain(domainParam);

  const key = domain ? `domain:route:${domain}` : null;

  if (!domain || !key) {
    return json({
      ok: false,
      marker: MARKER,
      nowIso: new Date().toISOString(),
      error: "Missing or invalid ?domain= parameter",
      received: domainParam,
      normalized: domain,
      example: "/api/domains/edge-probe?domain=yourdomain.com&ts=1",
    }, 400);
  }

  const out = await upstashGetString(key);

  // Do NOT leak secrets; env only reports presence + host of rest url
  const value = (out as any).result ?? null;

  return json({
    ok: true,
    marker: MARKER,
    nowIso: new Date().toISOString(),
    runtime: "edge",
    requested: { domain: domainParam, normalizedDomain: domain },
    key,
    env: (out as any).env,
    upstash: {
      ok: (out as any).upstashOk ?? false,
      status: (out as any).upstashStatus ?? null,
      urlHost: (out as any).env?.restUrlHost ?? null,
      rawFirst200: (out as any).rawFirst200 ?? null,
    },
    mapping: {
      exists: value !== null && value !== "",
      projectId: (typeof value === "string" ? value : null),
      raw: value,
    },
    note: "If env.hasRestUrl/hasRestToken is false => missing Vercel env vars. If mapping.exists is false => set domain:route:<domain>. If both true => Edge can read KV.",
  });
}
