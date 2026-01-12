import React from 'react';

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">Payment successful ✅</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Thanks — your subscription is active (or will be within a few seconds).
          </p>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            If your Projects page still shows the Free limit, click Refresh there — the webhook updates your plan in KV.
          </div>

          <div className="mt-6 flex gap-2">
            <a
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Go to Projects
            </a>

            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Back to Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
