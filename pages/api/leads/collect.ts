import type { NextApiRequest, NextApiResponse } from "next";

/**
 * REAL LEAD CAPTURE (Pages API)
 *
 * POST /api/leads/collect
 * Body: { email: string, prompt?: string, source?: string }
 *
 * Stores to Upstash Redis via REST API (inline wrapper; no TS alias imports).
 *
 * Keys:
 * - lead:<email>         -> JSON record (deduped)
 * - leads:latest         -> rolling list of JSON records (LPUSH, LTRIM)
 */

const MARKER = "LEAD_collect_v1_2026-01-23";

function nowIso() {
  return new Date().toISOString();
}

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

  // Upstash REST replies are JSON
  try {
    return JSON.parse(text) as T;
  } catch {
    // Should not happen, but keep safe
    return text as unknown as T;
  }
}

async function redisGet(key: string): Promise<any | null> {
  const out = await upstash<{ result: any }>(`/get/${encodeURIComponent(key)}`, { method: "GET" });
  return out?.result ?? null;
}

async function redisSet(key: string, value: any): Promise<void> {
  await upstash(`/set/${encodeURIComponent(key)}`, {
    method: "POST",
    body: JSON.stringify(value),
  });
}

async function redisExpire(key: string, seconds: number): Promise<void> {
  await upstash(`/expire/${encodeURIComponent(key)}/${seconds}`, { method: "POST" });
}

async function redisLpush(listKey: string, value: any): Promise<void> {
  await upstash(`/lpush/${encodeURIComponent(listKey)}`, {
    method: "POST",
    body: JSON.stringify(value),
  });
}

async function redisLtrim(listKey: string, start: number, stop: number): Promise<void> {
  await upstash(`/ltrim/${encodeURIComponent(listKey)}/${start}/${stop}`, { method: "POST" });
}

function isValidEmail(raw: string) {
  const s = (raw || "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type LeadBody = {
  email?: string;
  prompt?: string;
  source?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startedAt = Date.now();

  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, marker: MARKER, error: "Method Not Allowed" });
    }

    const body = (req.body || {}) as LeadBody;

    const emailRaw = (body.email || "").trim();
    const promptRaw = (body.prompt || "").trim();
    const sourceRaw = (body.source || "demo").trim();

    if (!isValidEmail(emailRaw)) {
      return res.status(400).json({
        ok: false,
        marker: MARKER,
        error: "Invalid email",
      });
    }

    const email = emailRaw.toLowerCase();
    const leadKey = `lead:${email}`;
    const feedKey = "leads:latest";

    const existing = await redisGet(leadKey);

    const record = {
      email,
      source: sourceRaw,
      prompt: promptRaw ? promptRaw.slice(0, 600) : "",
      firstSeenAtIso: existing?.firstSeenAtIso || nowIso(),
      lastSeenAtIso: nowIso(),
      hits: typeof existing?.hits === "number" ? existing.hits + 1 : 1,
      ua: (req.headers["user-agent"] || "").toString().slice(0, 240),
      ipHint:
        (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim().slice(0, 64) || "",
    };

    // Save deduped record, keep for 180 days
    await redisSet(leadKey, record);
    await redisExpire(leadKey, 60 * 60 * 24 * 180);

    // Push into latest feed (rolling 200)
    await redisLpush(feedKey, record);
    await redisLtrim(feedKey, 0, 199);

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      email,
      ms: Date.now() - startedAt,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      marker: MARKER,
      error: err?.message || "Unknown error",
    });
  }
}
