export const runtime = "nodejs";

export async function GET() {
  const price = process.env.STRIPE_PRICE_PRO || "";
  const key = process.env.STRIPE_SECRET_KEY || "";

  return Response.json(
    {
      ok: true,
      has_STRIPE_SECRET_KEY: Boolean(key),
      STRIPE_SECRET_KEY_prefix: key ? key.slice(0, 7) : null, // "sk_test_" or "sk_live_"
      has_STRIPE_PRICE_PRO: Boolean(price),
      STRIPE_PRICE_PRO_prefix: price ? price.slice(0, 10) : null, // "price_..."
      node_env: process.env.NODE_ENV || null,
      vercel_env: process.env.VERCEL_ENV || null, // "production" or "preview"
      vercel_url: process.env.VERCEL_URL || null,
    },
    { status: 200 }
  );
}
