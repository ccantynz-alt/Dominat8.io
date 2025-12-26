// app/page.tsx
export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>✅ Build Finished (Core)</h1>
      <p>Your app is deployed and routing correctly.</p>

      <h2>Checks</h2>
      <ul>
        <li>
          <a href="/api/health">/api/health</a>
        </li>
        <li>
          <a href="/api/projects">/api/projects</a>
        </li>
      </ul>
    </main>
  );
}
