// pages/api/stripe/ping.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await kv.lpush("stripe:ping", {
    at: new Date().toISOString(),
    method: req.method,
    ua: req.headers["user-agent"] ?? null,
  });

  return res.status(200).json({ ok: true, route: "/pages/api/stripe/ping.ts" });
}
