// /lib/stripe.ts
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error("Missing STRIPE_SECRET_KEY env var");
}

export const stripe = new Stripe(key, {
  // ✅ Must match the Stripe SDK types installed in your project
  apiVersion: "2025-02-24.acacia",
});
