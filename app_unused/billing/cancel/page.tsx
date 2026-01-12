// /app/billing/cancel/page.tsx
import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Checkout cancelled</h1>
      <p style={{ marginTop: 12 }}>
        No worries — you can upgrade again anytime.
      </p>
      <p style={{ marginTop: 16 }}>
        <Link href="/">Go back home</Link>
      </p>
    </main>
  );
}
