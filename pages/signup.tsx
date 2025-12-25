import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Prototype: signup behaves like login.
      const res = await fetch("/api/auth/login", { method: "POST" });
      if (!res.ok) throw new Error("Signup failed");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign up — Placeholder</title>
        <meta name="description" content="Create your account." />
      </Head>

      <Container>
        <section className="section" style={{ maxWidth: 520 }}>
          <h1 className="h1">Start your 7-day free trial</h1>
          <p className="p">Create an account in seconds.</p>

          <form onSubmit={onSignup} className="card">
            <label style={{ display: "block", marginBottom: 8 }}>Email</label>
            <input required type="email" placeholder="you@company.com" style={inputStyle} />

            <div style={{ height: 12 }} />

            <label style={{ display: "block", marginBottom: 8 }}>Password</label>
            <input required type="password" placeholder="Create a password" style={inputStyle} />

            <div style={{ height: 16 }} />

            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <p style={{ marginTop: 12, color: "var(--muted)" }}>
              Already have an account? <a className="link" href="/login">Log in</a>
            </p>

            <p style={{ marginTop: 6, color: "var(--muted-2)", fontSize: 13 }}>
              No credit card · Cancel anytime
            </p>
          </form>

          <div style={{ marginTop: 16 }}>
            <ButtonLink href="/">← Back to home</ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.85rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};
