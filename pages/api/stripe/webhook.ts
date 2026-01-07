import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

/**
 * IMPORTANT:
 * Stripe webhooks REQUIRE raw body access.
 * Do NOT remove this.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Initialize Stripe
 * DO NOT set apiVersion here.
 * Let the SDK use its own pinned version.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Read raw request body for Stripe signature verification
 */
async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

/**
 * Stripe Webhook Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /**
   * ✅ GET = sanity check in browser
   * Visiting the URL should return JSON, NOT HTML
   */
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      note: "stripe webhook route is alive (GET)",
    });
  }

  /**
   * Stripe will ONLY send POST
   */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const sig = req.headers["stripe-signature"];

    if (!sig || Array.isArray(sig)) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = await readRawBody(req);

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );

    /**
     * ✅ Log successful receipt
     */
    await kv.lpush("stripe:webhook:received", {
      at: new Date().toISOString(),
      method: "POST",
      type: event.type,
      id: event.id,
    });
    await kv.ltrim("stripe:webhook:received", 0, 49);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    /**
     * ❌ Log webhook errors
     */
    await kv.lpush("stripe:webhook:errors", {
      at: new Date().toISOString(),
      message: err?.message || String(err),
    });
    await kv.ltrim("stripe:webhook:errors", 0, 49);

    return res
      .status(400)
      .send(`Webhook Error: ${err?.message || String(err)}`);
  }
}
