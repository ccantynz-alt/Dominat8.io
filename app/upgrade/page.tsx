"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";

export default function UpgradePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Failed to create Stripe checkout.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>

        <p className="text-gray-700">
          You must be signed in so we can apply Pro to your account after payment.
        </p>

        {!isLoaded ? (
          <div className="rounded-xl border p-4 text-sm text-gray-700">
            Loading…
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-2xl border p-5 space-y-4">
            <p className="text-sm text-gray-700">
              You’re currently signed out.
            </p>

            <SignInButton mode="modal">
              <button className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
                Sign in to continue
              </button>
            </SignInButton>

            <div className="flex justify-between text-sm">
              <Link href="/pricing" className="hover:underline">
                Back to Pricing
              </Link>
              <Link href="/dashboard" className="hover:underline">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border p-5 space-y-3">
              <p className="font-semibold">What you’ll get with Pro</p>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Unlimited projects</li>
                <li>Unlimited published sites</li>
                <li>Custom domains</li>
                <li>Priority AI generation</li>
              </ul>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Opening Stripe Checkout..." : "Upgrade to Pro"}
            </button>

            <div className="flex justify-between text-sm">
              <Link href="/pricing" className="hover:underline">
                Back to Pricing
              </Link>
              <Link href="/dashboard" className="hover:underline">
                Back to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
