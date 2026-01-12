// app/fingerprint/page.tsx
import "server-only";

export default function FingerprintPage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Fingerprint</h1>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{JSON.stringify(
  {
    ok: true,
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercelGitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
  },
  null,
  2
)}
      </pre>
    </div>
  );
}
