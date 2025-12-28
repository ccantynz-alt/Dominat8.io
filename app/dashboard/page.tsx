// app/dashboard/page.tsx
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 16 }}>
        Projects + Runs + Apply (all in-app).
      </p>
      <DashboardClient />
    </main>
  );
}
