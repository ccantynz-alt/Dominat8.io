// FORCE_REDEPLOY_PROJECT_PAGE_001

export default function ProjectPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "4rem",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        ✅ Project Page Is Working
      </h1>

      <p style={{ fontSize: "1.25rem", maxWidth: "700px" }}>
        If you can see this page, then:
      </p>

      <ul style={{ marginTop: "2rem", fontSize: "1.1rem", lineHeight: "1.8" }}>
        <li>✔ GitHub saved the file</li>
        <li>✔ Vercel detected a change</li>
        <li>✔ The App Router is functioning</li>
        <li>✔ This deployment is NOT cached</li>
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
        File: <code>app/project/page.tsx</code>
      </p>
    </main>
  );
}
