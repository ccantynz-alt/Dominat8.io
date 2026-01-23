import type { NextApiRequest, NextApiResponse } from "next";

const MARKER = "RELEASE2D___echo__v1_2026-01-23";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const host = String(req.headers["host"] || "");
    const xForwardedHost = String(req.headers["x-forwarded-host"] || "");
    const xForwardedProto = String(req.headers["x-forwarded-proto"] || "");
    const xVercelId = String(req.headers["x-vercel-id"] || "");
    const xRealIp = String(req.headers["x-real-ip"] || "");
    const xForwardedFor = String(req.headers["x-forwarded-for"] || "");

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      method: req.method || null,
      url: req.url || null,
      nowIso: new Date().toISOString(),
      host,
      xForwardedHost,
      xForwardedProto,
      xVercelId,
      xRealIp,
      xForwardedFor,
      note: "This proves your Host header and BASE are reaching the Pages API (Node runtime).",
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      marker: MARKER,
      error: e?.message || String(e),
    });
  }
}
