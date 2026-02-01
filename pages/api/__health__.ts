import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("pragma", "no-cache");
  res.setHeader("x-d8-proof", "D8_PAGES_HEALTH_OK");
  res.status(200).json({ ok: true, now: new Date().toISOString(), via: "pages-api" });
}
