"use client";

export default function BillingPage() {
  async function checkout(priceId: string) {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        userId: "demo-user",
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div>
      <h1>Upgrade Plan</h1>

      <button onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!)}>
        Starter
      </button>

      <button onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!)}>
        Pro
      </button>

      <button onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS!)}>
        Business
      </button>
    </div>
  );
}
