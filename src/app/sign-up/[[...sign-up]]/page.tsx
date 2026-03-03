"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#06080e",
      padding: 24,
    }}>
      <div>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.05em" }}>D8</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(61,240,255,0.8)", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
          </a>
        </div>
        <SignUp />
      </div>
    </main>
  );
}
