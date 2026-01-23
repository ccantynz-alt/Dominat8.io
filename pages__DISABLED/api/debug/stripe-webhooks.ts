import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const receivedCount = await kv.llen("stripe:webhook:received");
  const errorsCount = await kv.llen("stripe:webhook:errors");
  const unlinkedCount = await kv.llen("stripe:webhook:unlinked");

  const received = (await kv.lrange("stripe:webhook:received", 0, 20)) ?? [];
  const errors = (await kv.lrange("stripe:webhook:errors", 0, 20)) ?? [];
  const unlinked = (await kv.lrange("stripe:webhook:unlinked", 0, 20)) ?? [];

  return res.status(200).json({
    ok: true,
    keys: ["stripe:webhook:received", "stripe:webhook:errors", "stripe:webhook:unlinked"],
    receivedCount,
    errorsCount,
    unlinkedCount,
    received,
    errors,
    unlinked,
  });
}
