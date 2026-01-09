"use client";

import Link from "next/link";

type UpgradeBannerProps = {
  isPro: boolean;
};

export default function UpgradeBanner({ isPro }: UpgradeBannerProps) {
  if (isPro) return null;

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex flex-col gap-3">
      <h3 className="text-lg font-semibold">
        You’re on the Free plan
      </h3>

      <p className="text-sm text-gray-700">
        Upgrade to Pro to unlock unlimited websites, custom domains,
        and priority AI generation.
      </p>

      <Link
        href="/pricing"
        className="inline-flex w-fit rounded-md bg-black px-4 py-2 text-white text-sm hover:bg-gray-800"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
