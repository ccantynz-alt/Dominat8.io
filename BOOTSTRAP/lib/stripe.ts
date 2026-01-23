import Stripe from "stripe";

export const runtime = "nodejs";

// IMPORTANT:
// This apiVersion must match the Stripe TypeScript literal type in your installed stripe package.
// Your build previously failed because "2024-06-20" didn't match the installed type.
// Using "2023-10-16" fixes that type mismatch for common stripe versions.

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});
