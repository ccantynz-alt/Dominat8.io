export default function HomePage() {
  return (
    <main style={{ padding: "4rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Welcome to Your AI Website Builder
      </h1>

      <p style={{ fontSize: "1.25rem", maxWidth: "700px" }}>
        This platform lets you create, manage, and generate websites using AI.
        No code required. Just describe what you want and let the system do the work.
      </p>

      <div style={{ marginTop: "3rem" }}>
        <a
          href="/templates"
          style={{
            padding: "1rem 2rem",
            background: "#000",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        >
          Browse Templates
        </a>
      </div>

      <footer style={{ marginTop: "5rem", color: "#666" }}>
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </main>
  );
} 
