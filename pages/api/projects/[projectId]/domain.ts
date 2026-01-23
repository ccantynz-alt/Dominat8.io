import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const KEY_DOMAIN = (projectId: string) => `project:${projectId}:domain:requested:v1`;
const KEY_STATUS = (projectId: string) => `project:${projectId}:domain:status:v1`;

type Status = {
  status: "none" | "pending" | "verified" | "error";
  lastCheckedIso: string | null;
  details?: any;
};

const DEFAULT_STATUS: Status = { status: "none", lastCheckedIso: null };

function safeJsonParse<T>(s: any, fallback: T): T {
  try {
    if (typeof s !== "string") s = String(s);
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  const nowIso = new Date().toISOString();

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId", nowIso });

  if (req.method === "GET") {
    try {
      const domain = await kv.get(KEY_DOMAIN(projectId));
      const statusRaw = await kv.get(KEY_STATUS(projectId));
      const status = statusRaw ? safeJsonParse<Status>(statusRaw, DEFAULT_STATUS) : DEFAULT_STATUS;

      return res.status(200).json({
        ok: true,
        projectId,
        domain: domain ? String(domain) : "",
        status,
        nowIso,
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? safeJsonParse<any>(req.body, {}) : (req.body || {});
      const domain = String(body.domain || "").trim().toLowerCase();

      if (!domain) return res.status(400).json({ ok: false, error: "Missing domain", nowIso });

      // Basic sanity (not perfect; just protects KV + UI)
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return res.status(400).json({ ok: false, error: "Domain format looks invalid", nowIso });
      }

      await kv.set(KEY_DOMAIN(projectId), domain);
      await kv.set(KEY_STATUS(projectId), JSON.stringify({ status: "pending", lastCheckedIso: null }));

      return res.status(200).json({
        ok: true,
        projectId,
        domain,
        status: { status: "pending", lastCheckedIso: null },
        nowIso,
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method Not Allowed", nowIso });
}

