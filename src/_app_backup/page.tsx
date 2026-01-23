export default function HomePage() {
  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
        my-saas-app
      </h1>
      <p style={{ marginBottom: "16px", lineHeight: 1.5 }}>
        If you can see this page, routing is working in production.
      </p>

      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <a href="/sign-in">Go to Sign In</a>
        </li>
        <li>
          <a href="/projects">Go to Projects</a>
        </li>
      </ul>
    </main>
  );
}
