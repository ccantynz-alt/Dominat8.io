import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        AI Website Builder
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        Build websites using AI. Create projects, run agents, and deploy instantly.
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/dashboard">
          <button style={buttonStyle}>Go to Dashboard</button>
        </Link>

        <Link href="/sign-in">
          <button style={buttonStyleSecondary}>Sign In</button>
        </Link>
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1.25rem",
  fontSize: "1rem",
  background: "#000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const buttonStyleSecondary: React.CSSProperties = {
  ...buttonStyle,
  background: "#555",
};
