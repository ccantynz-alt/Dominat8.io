export default function ProjectsPage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        Projects
      </h1>

      <p style={{ marginBottom: "2rem", color: "#555" }}>
        Your generated websites will appear here.
      </p>

      <div
        style={{
          border: "1px dashed #ccc",
          borderRadius: "8px",
          padding: "2rem",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        <p style={{ marginBottom: "1rem" }}>
          You don’t have any projects yet.
        </p>

        <a
          href="/templates"
          style={{
            padding: "0.75rem 1.25rem",
            background: "#000",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            display: "inline-block",
          }}
        >
          Create your first project
        </a>
      </div>
    </main>
  );
}
