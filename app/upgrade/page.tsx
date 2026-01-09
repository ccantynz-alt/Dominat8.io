import Link from "next/link";

export const metadata = {
  title: "Upgrade",
};

export default function UpgradePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>

        <p className="text-gray-700">
          Next step: we will connect this button to Stripe Checkout so upgrades
          actually charge and activate Pro automatically.
        </p>

        <div className="rounded-2xl border p-5 space-y-3">
          <p className="font-semibold">What you’ll get with Pro</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Unlimited projects</li>
            <li>Unlimited published sites</li>
            <li>Custom domains</li>
            <li>Priority AI generation</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            disabled
            className="rounded-md bg-black px-4 py-2 text-white opacity-60 cursor-not-allowed"
          >
            Upgrade (Stripe checkout next)
          </button>

          <Link
            href="/pricing"
            className="rounded-md border px-4 py-2 text-center hover:bg-gray-50"
          >
            Back to Pricing
          </Link>

          <Link
            href="/dashboard"
            className="text-center text-sm text-gray-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
