import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const KEY = "marketing:dominat8:gallery:v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const raw = await kv.get(KEY);

    if (!raw || typeof raw !== "string") {
      return res.status(200).json({
        ok: true,
        key: KEY,
        exists: false,
        gallery: null,
      });
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(200).json({
        ok: true,
        key: KEY,
        exists: true,
        gallery: raw,
        warning: "Stored value was not valid JSON",
      });
    }

    return res.status(200).json({
      ok: true,
      key: KEY,
      exists: true,
      gallery: parsed,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Unknown error",
    });
  }
}

