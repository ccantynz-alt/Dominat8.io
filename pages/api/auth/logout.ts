import type { NextApiRequest, NextApiResponse } from "next";
import { authClearCookieHeader } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  res.setHeader("Set-Cookie", authClearCookieHeader());
  return res.status(200).json({ ok: true });
}
