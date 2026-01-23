// pages/api/__redeploy__.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, nowIso: new Date().toISOString() });
}
