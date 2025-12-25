import type { NextApiRequest, NextApiResponse } from "next";
import { authSetCookieHeader } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  // Prototype: accept any credentials.
  // Later: validate against a DB/provider.
  res.setHeader("Set-Cookie", authSetCookieHeader());
  return res.status(200).json({ ok: true });
}
