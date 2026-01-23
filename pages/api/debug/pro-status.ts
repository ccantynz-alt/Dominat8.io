import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { kv } from '@/src/lib/kv';

function isTruthyString(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim().toLowerCase();
  return s === "true" || s === "1" || s === "pro" || s === "yes";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const rawPro = await kv.get(`pro:user:${userId}`);
    const pro = isTruthyString(rawPro);

    const rawAt = await kv.get(`pro:user:${userId}:atIso`);
    const atIso = typeof rawAt === "string" ? rawAt : null;

    return res.status(200).json({
      ok: true,
      userId,
      pro,
      rawPro: typeof rawPro === "string" ? rawPro : null,
      atIso,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}

