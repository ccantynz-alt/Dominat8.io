import type { NextApiRequest, NextApiResponse } from "next";

/**
 * ADMIN LEADS VIEWER (Pages API)
 *
 * GET /api/leads/latest?limit=50
 *
 * Auth:
 * - Header: x-admin-key: <ADMIN_API_KEY>
 *   OR
 * - Query:  ?adminKey=<ADMIN_API_KEY>
 *
 * Reads:
 * - leads:latest  (list of JSON lead records)
 */

const MARKER = "LEAD_latest_v1_2026-01-23";

function pickRestEnv() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    "";
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    "";

  return { url, token };
}

function requireRestEnv() {
  const { url, token } = pickRestEnv();
  if (!url || !token) {
    const missing = [];
    if (!url) missing.push("KV_REST_API_URL (or UPSTASH_REDIS_REST_URL)");
    if (!token) missing.push("KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)");
    throw new Error("Missing KV REST env: " + missing.join(", "));
  }
  return { url, token };
}

async function upstash<T = any>(path: string, init?: RequestInit): Promise<T> {
  const { url, token } = requireRestEnv();

  const res = await fetch(url.replace(/\/$/, "") + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    const bodyFirst200 = text.slice(0, 200);
    throw new Error(`Upstash error ${res.status}: ${bodyFirst200}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

async function redisLrange(listKey: string, start: number, stop: number): Promise<any[]> {
  const out = await upstash<{ result: any[] }>(
    `/lrange/${encodeURIComponent(listKey)}/${start}/${stop}`,
    { method: "GET" }
  );

  // Upstash returns list items already as JSON values if they were inserted as JSON
  return Array.isArray(out?.result) ? out.result : [];
}

function getAdminKey(req: NextApiRequest) {
  const headerKey = (req.headers["x-admin-key"] || "").toString();
  const queryKey = (req.query["adminKey"] || "").toString();
  return headerKey || queryKey;
}

function requireAdmin(req: NextApiRequest) {
  const expected = (process.env.ADMIN_API_KEY || "").trim();
  if (!expected) throw new Error("ADMIN_API_KEY env var is not set");

  const got = getAdminKey(req).trim();
  if (!got || got !== expected) {
    const err: any = new Error("Unauthorized");
    err.statusCode = 401;
    return err;
  }
  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startedAt = Date.now();

  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ ok: false, marker: MARKER, error: "Method Not Allowed" });
    }

    const authErr = requireAdmin(req);
    if (authErr) {
      return res.status(authErr.statusCode || 401).json({
        ok: false,
        marker: MARKER,
        error: authErr.message || "Unauthorized",
      });
    }

    const limitRaw = Number(req.query["limit"] || 50);
    const limit = clamp(Number.isFinite(limitRaw) ? limitRaw : 50, 1, 200);

    const feedKey = "leads:latest";
    const items = await redisLrange(feedKey, 0, limit - 1);

    // Basic stats
    const emails = new Set<string>();
    let hitsSum = 0;

    for (const it of items) {
      const email = (it?.email || "").toString().toLowerCase();
      if (email) emails.add(email);
      if (typeof it?.hits === "number") hitsSum += it.hits;
    }

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      key: feedKey,
      limit,
      count: items.length,
      uniqueEmails: emails.size,
      hitsSum,
      ms: Date.now() - startedAt,
      items,
    });
  } catch (err: any) {
    const status = err?.statusCode ? Number(err.statusCode) : 500;
    return res.status(status).json({
      ok: false,
      marker: MARKER,
      error: err?.message || "Unknown error",
    });
  }
}
