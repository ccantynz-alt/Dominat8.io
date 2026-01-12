export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      ok: true,
      has_STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
      has_STRIPE_PRICE_PRO: Boolean(process.env.STRIPE_PRICE_PRO),
      STRIPE_PRICE_PRO_value:
        process.env.STRIPE_PRICE_PRO?.slice(0, 12) + "...",
    },
    { status: 200 }
  );
}
