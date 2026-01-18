// pages/api/debug/map-domain.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@/src/app/lib/kv";

type Ok = {
  ok: true;
  host: string;
  projectId: string;
  key: string;
};

type Err = {
  ok: false;
  error: string;
};

function getAdminKey(req: NextApiRequest): string {
  const raw = req.headers["x-admin-key"];
  if (!raw) return "";
  return Array.isArray(raw) ? raw[0] : String(raw);
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const required = process.env.ADMIN_API_KEY || "";
  if (!required) {
    // Safety: if the env var is missing, this endpoint is unusable in prod.
    return res.status(403).json({ ok: false, error: "ADMIN_API_KEY is not set" });
  }

  const provided = getAdminKey(req);
  if (!provided || provided !== required) {
    return res.status(401).json({ ok: false, error: "Unauthorized (missing/invalid x-admin-key)" });
  }

  const { host, projectId } = (req.body || {}) as { host?: string; projectId?: string };

  const h = normalizeHost(host || "");
  const pid = String(projectId || "").trim();

  if (!h) return res.status(400).json({ ok: false, error: "Missing body.host" });
  if (!pid) return res.status(400).json({ ok: false, error: "Missing body.projectId" });

  const key = `domain:${h}:projectId`;
  await kv.set(key, pid);

  return res.status(200).json({ ok: true, host: h, projectId: pid, key });
}
