export const dynamic = "force-dynamic";

export default function BuildInfoPage() {
  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "unknown";

  const env = process.env.VERCEL_ENV || "unknown";

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Build Info</h1>
      <p style={{ marginTop: 12 }}>
        <strong>VERCEL_ENV:</strong> {env}
      </p>
      <p style={{ marginTop: 8 }}>
        <strong>GIT SHA:</strong> {sha}
      </p>
      <p style={{ marginTop: 16, color: "#555" }}>
        If this page shows your latest commit SHA, you are testing the correct deployment.
      </p>
    </main>
  );
}
