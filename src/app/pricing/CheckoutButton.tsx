"use client";

import { useRouter } from "next/navigation";

interface Props {
  plan: string;
  label: string;
  style?: React.CSSProperties;
}

export function CheckoutButton({ plan, label, style }: Props) {
  const router = useRouter();

  async function handleClick() {
    // Free plan → just go to builder
    if (plan === "free") {
      router.push("/");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (res.status === 401) {
      // Not signed in — send to sign-up then back to pricing
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }

    const data = await res.json() as { url?: string; error?: string };

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      style={style}
    >
      {label}
    </button>
  );
}
