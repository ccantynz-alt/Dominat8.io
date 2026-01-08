// app/components/UpgradeToProDialog.tsx

"use client";

import React from "react";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function UpgradeToProDialog({
  open,
  title = "Upgrade to Pro",
  message,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Not now
            </button>

            <a
              href="/billing"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Upgrade to Pro
            </a>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Tip: Pro removes project limits and unlocks the full builder experience.
          </p>
        </div>
      </div>
    </div>
  );
}
