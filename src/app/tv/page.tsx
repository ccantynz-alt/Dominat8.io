export const dynamic = "force-dynamic";

export default function TV() {
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>D8 TV (Staging)</h1>
      <p style={{ opacity: 0.75, marginBottom: 16 }}>
        If you can see this, the Next.js app router is compiling.
      </p>
      <ul style={{ lineHeight: 1.7 }}>
        <li><a href="/api/io/health">/api/io/health</a></li>
        <li><a href="/api/io/ping">/api/io/ping</a></li>
        <li><a href="/api/io/state">/api/io/state</a></li>
        <li><a href="/io">/io</a></li>
      </ul>
    </main>
  );
}