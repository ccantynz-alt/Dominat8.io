import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { kv } from '@/src/lib/kv';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Stripe requires the raw body to verify signatures
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).send("Method Not Allowed");
    }

    const stripeSecretKey = mustEnv("STRIPE_SECRET_KEY");
    const webhookSecret = mustEnv("STRIPE_WEBHOOK_SECRET");

    // ✅ IMPORTANT: matches your installed Stripe SDK type
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      return res.status(400).send("Missing stripe-signature header");
    }

    const rawBody = await readRawBody(req);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err?.message || "Invalid signature"}`);
    }

    // ---- Handle events ----
    // We prefer to set Pro based on checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        (session.metadata && (session.metadata as any).userId) ||
        null;

      // If you set client_reference_id = userId in checkout.ts, fall back to it
      const fallbackUserId =
        (typeof session.client_reference_id === "string" && session.client_reference_id) ||
        null;

      const finalUserId = (userId as string | null) || (fallbackUserId as string | null);

      if (finalUserId) {
        // Mark user as Pro
        await kv.set(`pro:user:${finalUserId}`, "true");

        // Optional: keep some debug state
        await kv.set(`stripe:lastCheckoutSessionByUser:${finalUserId}`, session.id);
      }
    }

    // You can add more event handlers later (subscription updated, canceled, etc.)

    return res.status(200).json({ ok: true, received: true, type: event.type });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}

