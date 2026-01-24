export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Segoe UI, Roboto, Arial" }}>
      <h1>DEPLOY_PROBE_OK</h1>
      <p>Hit <a href="/api/__probe__">/api/__probe__</a></p>
    </main>
  );
}
