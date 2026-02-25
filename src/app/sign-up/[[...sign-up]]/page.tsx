import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up — Dominat8.io" };

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export default function SignUpPage() {
  const hasClerk = Boolean(publishableKey.trim());

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
        {hasClerk ? (
          <SignUp />
        ) : (
          <div style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", maxWidth: 360 }}>
            <p style={{ marginBottom: 12 }}>Sign-up is not configured.</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              Set <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4 }}>.env.local</code> and restart the dev server.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
