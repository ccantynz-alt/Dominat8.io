import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, stamp: "STAMP_TV_ROUTES_007_20260208_211257", utc: new Date().toISOString() });
}