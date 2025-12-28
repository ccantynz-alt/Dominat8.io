"use client";

import Link from "next/link";
import { useLocalStorage } from "./ui/useLocalStorage";

export function OnboardingPanel({ ctaHref }: { ctaHref: string }) {
  const [dismissed, setDismissed] = useLocalStorage<boolean>("onboarding:dismissed", false);

  if (dismissed) return null;

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.10)",
        padding: 18,
        background: "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Welcome — let’s build your website</h2>
        <button
          onClick={() => setDismissed(true)}
          style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 14, color: "rgba(0,0,0,0.65)" }}
        >
          Dismiss
        </button>
      </div>

      <ol style={{ marginTop: 10, marginBottom: 12, paddingLeft: 18, color: "rgba(0,0,0,0.78)" }}>
        <li>Describe your website</li>
        <li>Preview the result</li>
        <li>Publish when you’re ready</li>
      </ol>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link
          href={ctaHref}
          style={{
            display: "inline-flex",
            background: "black",
            color: "white",
            padding: "10px 14px",
            borderRadius: 14,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Build my first site →
        </Link>

        <span style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>
          You can preview everything before publishing.
        </span>
      </div>
    </div>
  );
}
