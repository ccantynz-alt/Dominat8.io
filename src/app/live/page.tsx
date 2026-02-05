export default function Live() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>LIVE_OK</h1>
      <p>Host: staging bypass active</p>
      <p>Stamp: {new Date().toISOString()}</p>
    </main>
  );
}
