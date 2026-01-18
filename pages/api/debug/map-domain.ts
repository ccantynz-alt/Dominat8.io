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

// Kill switch: endpoint is enabled ONLY when MAP_DOMAIN_ENABLED === "true"
function isEnabled(): boolean {
  return String(process.env.MAP_DOMAIN_ENABLED || "").trim().toLowerCase() === "true";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  // ✅ LOCKDOWN: hide the endpoint unless explicitly enabled
  if (!isEnabled()) {
    // Return 404 so it looks like it doesn't exist
    return res.status(404).json({ ok: false, error: "Not Found" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const required = String(process.env.ADMIN_API_KEY || "").trim();
  if (!required) {
    return res.status(403).json({ ok: false, error: "ADMIN_API_KEY is not set" });
  }

  const provided = String(getAdminKey(req) || "").trim();
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
