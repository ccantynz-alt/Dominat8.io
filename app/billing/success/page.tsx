"use client";

import { useEffect } from "react";

export default function BillingSuccess() {
  useEffect(() => {
    const userId = "demo-user"; // replace later with real auth

    fetch("/api/billing/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>✅ Subscription active</h1>
      <p>Your account is now upgraded.</p>
    </main>
  );
}
