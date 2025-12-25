// FORCE_REDEPLOY_PAGES_ROUTER_001

export default function ProjectPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "4rem",
        background: "linear-gradient(135deg, #020617, #0f172a)",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        ✅ Pages Router Is Working
      </h1>

      <p style={{ fontSize: "1.25rem", maxWidth: "700px" }}>
        If you can see this page, then your deployment pipeline is working
        correctly.
      </p>

      <ul style={{ marginTop: "2rem", lineHeight: "1.8" }}>
        <li>✔ GitHub committed the change</li>
        <li>✔ Vercel deployed the correct repo</li>
        <li>✔ Pages router is active</li>
      </ul>

      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          background: "#020617",
          border: "1px solid #334155",
          borderRadius: "12px",
        }}
      >
        <strong>Timestamp:</strong>
        <br />
        {new Date().toLocaleString()}
      </div>

      <p style={{ marginTop: "3rem", opacity: 0.7 }}>
        File: <code>pages/project.tsx</code>
      </p>
    </div>
  );
}
