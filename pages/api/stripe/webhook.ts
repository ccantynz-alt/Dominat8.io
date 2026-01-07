import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

export const config = {
  api: {
    bodyParser: false, // IMPORTANT for Stripe signature verification
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Simple "alive" check in browser
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, note: "stripe webhook route is alive (GET)" });
  }

  // Stripe will POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const sig = req.headers["stripe-signature"];
    if (!sig || Array.isArray(sig)) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = await readRawBody(req);

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    // ✅ Log receipt to KV
    await kv.lpush("stripe:webhook:received", {
      at: new Date().toISOString(),
      method: req.method,
      type: event.type,
      id: event.id,
    });
    await kv.ltrim("stripe:webhook:received", 0, 49);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    await kv.lpush("stripe:webhook:errors", {
      at: new Date().toISOString(),
      message: err?.message || String(err),
    });
    await kv.ltrim("stripe:webhook:errors", 0, 49);

    return res.status(400).send(`Webhook Error: ${err?.message || String(err)}`);
  }
}
