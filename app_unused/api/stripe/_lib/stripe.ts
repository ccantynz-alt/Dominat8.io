import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(stripeSecretKey, {
  // Your installed Stripe SDK expects this literal API version type.
  // Keep this in sync with the Stripe SDK type union to avoid build failures.
  apiVersion: "2023-10-16",
});

