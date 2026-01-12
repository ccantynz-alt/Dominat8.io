"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = "free" | "pro";

export default function UpgradeBanner() {
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/me/plan", { method: "GET" });
        const data = await res.json();
        if (mounted && data?.plan) setPlan(data.plan);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (plan === "pro") return null;

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex flex-col gap-3">
      <h3 className="text-lg font-semibold">You’re on the Free plan</h3>

      <p className="text-sm text-gray-700">
        Upgrade to Pro to unlock unlimited websites, custom domains, and priority
        AI generation.
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
