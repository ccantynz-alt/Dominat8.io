import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { kv } from '@/src/lib/kv';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getBaseUrl(req: NextApiRequest): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_URL;

  if (explicit) {
    if (explicit.startsWith("http://") || explicit.startsWith("https://")) return explicit;
    return `https://${explicit}`;
  }

  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "https";

  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers.host as string) ||
    "";

  return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const stripeSecretKey = mustEnv("STRIPE_SECRET_KEY");
    const priceId = mustEnv("STRIPE_PRICE_ID");

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const baseUrl = getBaseUrl(req);

    const body =
      typeof req.body === "string"
        ? (() => {
            try {
              return JSON.parse(req.body);
            } catch {
              return {};
            }
          })()
        : req.body || {};

    const successPath =
      (typeof body.successPath === "string" && body.successPath) || "/billing/success";
    const cancelPath =
      (typeof body.cancelPath === "string" && body.cancelPath) || "/billing/cancel";

    const successUrl = `${baseUrl}${successPath}`;
    const cancelUrl = `${baseUrl}${cancelPath}`;

    // IMPORTANT: kv.get() in this repo does not accept generic type args.
    const customerKey = `stripe:customerByUser:${userId}`;
    const existing = await kv.get(customerKey);
    let customerId = (existing as string | null) || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
      await kv.set(customerKey, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      client_reference_id: userId,
      metadata: { userId },
    });

    return res.status(200).json({
      ok: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      baseUrl,
      successUrl,
      cancelUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}

