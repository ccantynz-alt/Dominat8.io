"use client";

import { SignInButton, useUser } from "@clerk/nextjs";

export default function UpgradePage() {
  const { isLoaded, isSignedIn } = useUser();

  // During hydration / first load, Clerk might not be ready yet
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-gray-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading…</h1>
          <p className="text-gray-600">
            Preparing your upgrade options.
          </p>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-gray-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Sign in to upgrade</h1>
          <p className="text-gray-600 mb-6">
            Please sign in first, then you can upgrade your plan.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition">
              Sign in
            </button>
          </SignInButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-3">Upgrade to Pro</h1>
        <p className="text-gray-600 mb-8">
          Unlock custom domains, higher limits, and faster publishing.
        </p>

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Pro Plan</h2>
          <ul className="text-gray-700 space-y-2 mb-6">
            <li>• Custom domains</li>
            <li>• Higher project limits</li>
            <li>• Priority generation</li>
          </ul>

          <a
            href="/api/billing/checkout"
            className="inline-block px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition"
          >
            Continue to checkout
          </a>
        </div>
      </div>
    </main>
  );
}
