// FORCE_REDEPLOY_HOME_001

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "3rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "2.5rem" }}>✅ Home page is updating</h1>
      <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
        If this headline changed, your deploy pipeline is working.
      </p>

      <p style={{ marginTop: "1.5rem" }}>
        View the project test page:{" "}
        <Link href="/project" style={{ textDecoration: "underline" }}>
          /project
        </Link>
      </p>

      <div style={{ marginTop: "2rem", opacity: 0.7 }}>
        Timestamp: {new Date().toLocaleString()}
      </div>

      <div style={{ marginTop: "0.75rem", opacity: 0.7 }}>
        File: <code>pages/index.tsx</code>
      </div>
    </div>
  );
}
