import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const FLOW_KEY = "marketing:dominat8:flow:v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const value = await kv.get(FLOW_KEY);

    return res.status(200).json({
      ok: true,
      key: FLOW_KEY,
      hasValue: !!value,
      value: value ?? null,
      nowIso: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "flow read failed",
      nowIso: new Date().toISOString(),
    });
  }
}

