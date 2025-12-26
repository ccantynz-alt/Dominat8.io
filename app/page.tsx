// app/page.tsx
export default function HomePage() {
  return (
    <main style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1>✅ My SaaS App is Live</h1>
      <p>Your backend is deployed and working.</p>

      <h2>API</h2>
      <p>
        <a href="/api/projects">/api/projects</a>
      </p>
    </main>
  );
}
