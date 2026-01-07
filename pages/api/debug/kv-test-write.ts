import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const item = {
    at: new Date().toISOString(),
    note: "manual kv test write",
    method: req.method,
  };

  await kv.lpush("stripe:webhook:received", item);

  return res.status(200).json({ ok: true, wroteTo: "stripe:webhook:received", item });
}

