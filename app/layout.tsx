// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicMode } from "./lib/publicMode";
import { isAdmin } from "./lib/isAdmin";

export const metadata: Metadata = {
  title: "my-saas-app",
  description: "AI Website Builder",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = await getPublicMode();
  const admin = await isAdmin();

  // Show admin navigation only when:
  // - Public mode is OFF (builder mode), OR
  // - user is admin (logged in)
  const showAdminNav = mode === "off" || admin;

  return (
    <html lang="en">
      <body>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 700 }}>my-saas-app</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Home</div>
            </div>

            {showAdminNav ? (
              <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Link
                  href="/projects"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: 14,
                  }}
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: 14,
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/generated"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: 14,
                  }}
                >
                  Generated
                </Link>
              </nav>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.65 }}>
                Public site mode
              </div>
            )}
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
