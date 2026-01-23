import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

function toStr(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeHost(host: string) {
  // strip port
  const h = host.replace(/:\d+$/, "").trim().toLowerCase();
  return h;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = normalizeHost(toStr(req.query.host));
  if (!host) return res.status(400).json({ ok: false, error: "Missing host" });

  const key = `domain:map:${host}`;
  const projectId = toStr(await kv.get(key));

  return res.status(200).json({
    ok: true,
    host,
    projectId: projectId || "",
    found: !!projectId,
  });
}

