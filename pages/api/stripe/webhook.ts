import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

export const config = {
  api: { bodyParser: false },
};

function buffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    readable.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) return res.status(500).json({ ok: false, error: "Missing STRIPE_SECRET_KEY" });
  if (!whsec) return res.status(500).json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET" });

  const stripe = new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });

  const sig = req.headers["stripe-signature"];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).json({ ok: false, error: "Missing stripe-signature" });
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, whsec);
  } catch (err: any) {
    await kv.lpush("stripe:webhook:errors", {
      at: new Date().toISOString(),
      error: "Signature verification failed",
      message: err?.message ?? "unknown",
    });
    return res.status(400).json({ ok: false, error: `Signature verification failed: ${err?.message ?? "unknown"}` });
  }

  // ✅ log every received event
  await kv.lpush("stripe:webhook:received", {
    at: new Date().toISOString(),
    id: event.id,
    type: event.type,
    created: event.created,
  });

  // (We’ll add subscription linking next; first we just prove delivery.)
  return res.status(200).json({ ok: true });
}
