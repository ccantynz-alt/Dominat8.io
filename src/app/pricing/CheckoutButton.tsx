"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  plan: string;
  label: string;
  style?: React.CSSProperties;
  className?: string;
}

export function CheckoutButton({ plan, label, style, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clickedRef = useRef(false);

  async function handleClick() {
    // Free plan → go straight to builder
    if (plan === "free") {
      router.push("/build");
      return;
    }

    // Prevent double-click
    if (clickedRef.current) return;
    clickedRef.current = true;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        router.push(`/sign-up?redirect_url=/pricing`);
        return;
      }

      const data = await res.json() as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
        // Don't reset loading — we're navigating away
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        clickedRef.current = false;
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
      clickedRef.current = false;
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        type="button"
        disabled={loading}
        className={className}
        style={{
          ...style,
          opacity: loading ? 0.65 : 1,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <div style={{ color: "#FF4757", fontSize: 12, marginTop: 6, textAlign: "center" }}>
          {error}
        </div>
      )}
    </>
  );
}
