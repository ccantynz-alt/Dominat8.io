"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

/**
 * Auth header as a client component so Clerk (SignedIn/SignedOut/UserButton)
 * runs only on the client. Avoids Next.js 15+ async headers() / auth() issues
 * when rendered in the server layout.
 */
export function AuthHeader() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        minHeight: "48px",
        background: "rgba(4, 6, 14, 0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "#9aa3c7",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "9999px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            style={{
              padding: "8px 16px",
              background: "#3DF0FF",
              color: "#04060e",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}
