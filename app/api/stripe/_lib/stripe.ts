import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(secretKey, {
  // IMPORTANT:
  // Your installed Stripe SDK expects this literal API version type.
  // Using a newer string (like "2025-02-24.acacia") will fail TypeScript at build time.
  apiVersion: "2024-06-20",
});

